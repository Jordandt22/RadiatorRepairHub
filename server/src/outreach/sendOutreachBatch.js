import {
  getOutreachBusinessesByIds,
  insertOutreachHistory,
} from "../supabase/supabase.functions.js";
import {
  applyOutreachDevelopmentCap,
  buildOutreachEmailContent,
  buildOutreachEmailPayload,
  evaluateOutreachEligibility,
  isOutreachDevRedirect,
  resolveOutreachRecipientEmail,
} from "../lib/outreachSend.js";
import { resendClient } from "../resend/resend.js";

export class OutreachSendError extends Error {
  constructor(code, message, cause = null) {
    super(message, cause ? { cause } : undefined);
    this.name = "OutreachSendError";
    this.code = code;
    this.details = cause;
  }
}

export const planOutreachBatch = (
  businessIds,
  businesses,
  outreachType
) => {
  const byId = new Map((businesses ?? []).map((row) => [row.id, row]));
  const skipped = [];
  const eligible = [];

  for (const id of businessIds) {
    const business = byId.get(id);
    if (!business) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    const result = evaluateOutreachEligibility(business, outreachType);
    if (!result.ok) {
      skipped.push({
        id,
        reason: result.reason,
        title: business.title ?? null,
      });
      continue;
    }

    eligible.push({ business, recipient: result.recipient });
  }

  return { skipped, eligible };
};

function assertEmailConfiguration() {
  const { SENDER_EMAIL, TEST_RECIPIENT_EMAIL, RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    throw new OutreachSendError(
      "email_not_configured",
      "Email sending is not configured."
    );
  }
  if (isOutreachDevRedirect() && !TEST_RECIPIENT_EMAIL) {
    throw new OutreachSendError(
      "test_recipient_missing",
      "TEST_RECIPIENT_EMAIL is required in development."
    );
  }
  return { senderEmail: SENDER_EMAIL };
}

export async function sendOutreachBatch({
  businessIds,
  outreachType,
  idempotencyKey = null,
  outreachJobId = null,
}) {
  const { senderEmail } = assertEmailConfiguration();
  const { data: businesses, error: fetchError } =
    await getOutreachBusinessesByIds(businessIds);

  if (fetchError) {
    throw new OutreachSendError(
      "business_fetch_failed",
      "There was an error fetching businesses.",
      fetchError
    );
  }

  const { skipped, eligible } = applyOutreachDevelopmentCap(
    planOutreachBatch(businessIds, businesses, outreachType)
  );

  if (eligible.length === 0) {
    return { sent: [], skipped, resendIds: [], history: [] };
  }

  const batchPayload = eligible.map(({ business, recipient }) =>
    buildOutreachEmailPayload({
      business,
      outreachType,
      recipient,
      senderEmail,
    })
  );
  const options = idempotencyKey ? { idempotencyKey } : undefined;
  const { data: batchData, error: batchError } =
    await resendClient()?.batch?.send(batchPayload, options);

  if (batchError) {
    throw new OutreachSendError(
      "resend_failed",
      batchError.message || "Failed to send emails.",
      batchError
    );
  }

  const resendResults = Array.isArray(batchData)
    ? batchData
    : batchData?.data ?? [];
  const sentAt = new Date().toISOString();
  const historyRows = eligible.map(({ business, recipient }, index) => {
    const content = buildOutreachEmailContent(business, outreachType);
    const deliveryTo = resolveOutreachRecipientEmail(recipient);
    return {
      business_id: business.id,
      message_type: "email",
      outreach_type: outreachType,
      recipient,
      subject: content?.subject ?? null,
      provider: "resend",
      provider_message_id: resendResults[index]?.id ?? null,
      sent_at: sentAt,
      sent_by: null,
      metadata: {
        delivery_to: deliveryTo,
        dev_redirect: isOutreachDevRedirect(),
        ...(outreachJobId ? { outreach_job_id: outreachJobId } : {}),
        ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
      },
    };
  });

  const { data: inserted, error: insertError } =
    await insertOutreachHistory(historyRows);
  if (insertError) {
    throw new OutreachSendError(
      "history_insert_failed",
      "Emails were sent but outreach history could not be saved.",
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
