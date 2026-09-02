import {
  fetchBusinessStats,
  getDigestBusinessesByIds,
  insertDigestHistory,
  listEmailSuppressionsForBusinesses,
} from "../supabase/supabase.functions.js";
import { supabase } from "../supabase/supabase.js";
import {
  applyOutreachDevelopmentCap,
  isOutreachDevRedirect,
  resolveOutreachRecipientEmail,
} from "../lib/outreachSend.js";
import {
  WEEKLY_DIGEST_DAYS,
  evaluateDigestEligibility,
  buildWeeklyDigestStats,
} from "../lib/weeklyDigestStats.js";
import { buildWeeklyDigestEmailPayload } from "../lib/weeklyDigestSend.js";
import { BULK_EMAIL_SUPPRESSION_TYPES } from "../lib/emailSuppressionTypes.js";
import { resendClient } from "../resend/resend.js";

export class DigestSendError extends Error {
  constructor(code, message, cause = null) {
    super(message, cause ? { cause } : undefined);
    this.name = "DigestSendError";
    this.code = code;
    this.details = cause;
  }
}

export async function planDigestBatch(businessIds, businesses, digestSegment) {
  const byId = new Map((businesses ?? []).map((row) => [row.id, row]));
  const skipped = [];
  const eligible = [];
  const suppressions = await listEmailSuppressionsForBusinesses(
    businessIds,
    BULK_EMAIL_SUPPRESSION_TYPES
  );

  const statsById = new Map();
  await Promise.all(
    (businesses ?? []).map(async (business) => {
      const { data, error } = await fetchBusinessStats(
        supabase,
        business.id,
        WEEKLY_DIGEST_DAYS
      );
      statsById.set(business.id, { data, error });
    })
  );

  for (const id of businessIds) {
    const business = byId.get(id);
    if (!business) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    const statsEntry = statsById.get(business.id);
    if (statsEntry?.error) {
      skipped.push({
        id,
        reason: "stats_fetch_failed",
        title: business.title ?? null,
      });
      continue;
    }

    const firstPass = evaluateDigestEligibility(business, digestSegment, {
      stats: statsEntry?.data,
      ownerAuthEmail: business.owner_email,
    });
    if (!firstPass.ok) {
      skipped.push({
        id,
        reason: firstPass.reason,
        title: business.title ?? null,
      });
      continue;
    }

    if (suppressions.has(`${business.id}:${firstPass.recipient}`)) {
      skipped.push({
        id,
        reason: "suppressed",
        title: business.title ?? null,
      });
      continue;
    }

    eligible.push({
      business,
      recipient: firstPass.recipient,
      digestStats: buildWeeklyDigestStats(statsEntry?.data, business),
    });
  }

  return { skipped, eligible };
}

function assertEmailConfiguration() {
  const { SENDER_EMAIL, TEST_RECIPIENT_EMAIL, RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    throw new DigestSendError(
      "email_not_configured",
      "Email sending is not configured."
    );
  }
  if (isOutreachDevRedirect() && !TEST_RECIPIENT_EMAIL) {
    throw new DigestSendError(
      "test_recipient_missing",
      "TEST_RECIPIENT_EMAIL is required in development."
    );
  }
  return { senderEmail: SENDER_EMAIL };
}

export async function sendDigestBatch({
  businessIds,
  digestSegment,
  idempotencyKey = null,
  digestJobId = null,
}) {
  const { senderEmail } = assertEmailConfiguration();
  const { data: businesses, error: fetchError } =
    await getDigestBusinessesByIds(businessIds);

  if (fetchError) {
    throw new DigestSendError(
      "business_fetch_failed",
      "There was an error fetching businesses.",
      fetchError
    );
  }

  const planned = await planDigestBatch(
    businessIds,
    businesses,
    digestSegment
  );
  const { skipped, eligible } = applyOutreachDevelopmentCap(planned);

  if (eligible.length === 0) {
    return { sent: [], skipped, resendIds: [], history: [] };
  }

  const batchPayload = eligible.map(({ business, recipient, digestStats }) =>
    buildWeeklyDigestEmailPayload({
      business,
      digestStats,
      recipient,
      senderEmail,
    })
  );
  const options = idempotencyKey ? { idempotencyKey } : undefined;
  const { data: batchData, error: batchError } =
    await resendClient()?.batch?.send(batchPayload, options);

  if (batchError) {
    throw new DigestSendError(
      "resend_failed",
      batchError.message || "Failed to send emails.",
      batchError
    );
  }

  const resendResults = Array.isArray(batchData)
    ? batchData
    : batchData?.data ?? [];
  const sentAt = new Date().toISOString();
  const historyRows = eligible.map(({ business, recipient, digestStats }, index) => {
    const content = buildWeeklyDigestEmailPayload({
      business,
      digestStats,
      recipient,
      senderEmail,
    });
    return {
      business_id: business.id,
      digest_segment: digestSegment,
      recipient,
      subject: content?.subject ?? null,
      provider: "resend",
      provider_message_id: resendResults[index]?.id ?? null,
      sent_at: sentAt,
      send_job_id: digestJobId ?? null,
      metadata: {
        delivery_to: resolveOutreachRecipientEmail(recipient),
        dev_redirect: isOutreachDevRedirect(),
        tier: digestStats.tier,
        ...(digestJobId ? { digest_job_id: digestJobId } : {}),
        ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
      },
    };
  });

  const { data: inserted, error: insertError } =
    await insertDigestHistory(historyRows);
  if (insertError) {
    throw new DigestSendError(
      "history_insert_failed",
      "Emails were sent but digest history could not be saved.",
      insertError
    );
  }

  return {
    sent: (inserted ?? []).map((row) => row.business_id),
    skipped,
    resendIds: resendResults.map((item) => item?.id).filter(Boolean),
    history: inserted ?? [],
  };
}
