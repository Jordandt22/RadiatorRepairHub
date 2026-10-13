import { logger } from "../lib/logger.js";
import {
  groupBusinessesByClaimPhone,
  nextAllowedAtAfterLookup,
  nextLineTypeLookupStep,
  paceWaitMs,
} from "../lib/phoneLineType.js";
import { lookupPhoneLineType } from "../twilio/lookup.js";
import {
  listPhoneLineTypeJobBusinesses,
  saveBusinessPhoneLineTypes,
} from "../supabase/supabase.functions.js";
import {
  getPhoneLineTypeJob,
  markPhoneLineTypeJobCompleted,
  markPhoneLineTypeJobFailed,
  markPhoneLineTypeJobRunning,
  updatePhoneLineTypeJobCounts,
} from "./db.js";

function sleep(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function lookupWithPace(phoneE164, pace) {
  let attempt = 0;

  while (true) {
    const wait = paceWaitMs(Date.now(), pace.nextAllowedAt);
    await sleep(wait);

    const lookup = await lookupPhoneLineType(phoneE164);
    if (lookup.ok) {
      pace.nextAllowedAt = nextAllowedAtAfterLookup(Date.now(), {
        cached: lookup.cached === true,
      });
      return lookup;
    }

    if (lookup.error?.type === "config") {
      const error = new Error(lookup.error.message);
      error.code = "config";
      throw error;
    }

    attempt += 1;
    const step = nextLineTypeLookupStep(lookup.error, attempt);
    if (step.action === "retry") {
      pace.nextAllowedAt = nextAllowedAtAfterLookup(Date.now(), {
        cached: false,
      });
      await sleep(step.delayMs);
      continue;
    }

    return { ok: false, error: lookup.error, action: step.action };
  }
}

export async function processPhoneLineTypeJob(job) {
  const jobId = job?.data?.jobId;
  if (!jobId) return { skipped: true };

  const existing = await getPhoneLineTypeJob(jobId);
  if (!existing || existing.status === "completed") {
    return { skipped: true };
  }

  const resuming = existing.status === "running";
  let succeeded = existing.succeeded_count ?? 0;
  let failed = existing.failed_count ?? 0;
  let skipped = existing.skipped_count ?? 0;

  const persist = () =>
    updatePhoneLineTypeJobCounts(jobId, { succeeded, failed, skipped });

  try {
    await markPhoneLineTypeJobRunning(jobId);

    const { data: rows, error } = await listPhoneLineTypeJobBusinesses(
      existing.business_ids
    );
    if (error) throw error;

    const unchecked = [];
    let alreadyChecked = 0;
    for (const row of rows ?? []) {
      if (row.phone_line_type_checked_at) alreadyChecked += 1;
      else unchecked.push(row);
    }

    if (!resuming && alreadyChecked > 0) {
      skipped += alreadyChecked;
      await persist();
    }

    const { groups, invalidIds } = groupBusinessesByClaimPhone(unchecked);
    if (invalidIds.length) {
      const saved = await saveBusinessPhoneLineTypes(invalidIds, {});
      if (saved.error) throw saved.error;
      skipped += invalidIds.length;
      await persist();
    }

    const pace = { nextAllowedAt: 0 };

    for (const [phoneE164, ids] of groups) {
      const lookup = await lookupWithPace(phoneE164, pace);
      if (!lookup.ok) {
        logger.warn(
          { err: lookup.error, phoneE164, ids, action: lookup.action },
          "Phone line type lookup failed"
        );

        if (lookup.action === "stop") {
          failed += ids.length;
          await persist();
          await markPhoneLineTypeJobFailed(
            jobId,
            "Twilio rate limit reached. Remaining numbers were left unchecked."
          );
          return { stopped: "rate_limit", succeeded, failed, skipped };
        }

        const saved = await saveBusinessPhoneLineTypes(ids, {});
        if (saved.error) throw saved.error;
        failed += ids.length;
        await persist();
        continue;
      }

      const saved = await saveBusinessPhoneLineTypes(ids, {
        lineType: lookup.data.lineType,
        carrier: lookup.data.carrier,
      });
      if (saved.error) throw saved.error;
      succeeded += ids.length;
      await persist();
    }

    await markPhoneLineTypeJobCompleted(jobId);
    return { done: true, succeeded, failed, skipped };
  } catch (error) {
    const attempts = job?.opts?.attempts ?? 1;
    const isLast = (job?.attemptsMade ?? 0) + 1 >= attempts;
    if (error?.code === "config" || isLast) {
      await markPhoneLineTypeJobFailed(
        jobId,
        error?.message || "Phone line type job failed."
      );
    }
    if (error?.code === "config") {
      return { stopped: "config" };
    }
    throw error;
  }
}
