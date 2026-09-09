import {
  evaluateOutreachSmsDeclineEligibility,
  evaluateOutreachSmsEligibility,
} from "../lib/outreachSend.js";

/**
 * Texts are sent by hand from Google Voice, so this only decides which
 * businesses may be recorded as texted. Email suppressions do not apply.
 */
export function planOutreachSmsBatch(businessIds, businesses, outreachType) {
  const byId = new Map((businesses ?? []).map((row) => [row.id, row]));
  const skipped = [];
  const eligible = [];

  for (const id of businessIds) {
    const business = byId.get(id);
    if (!business) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    const provisional = evaluateOutreachSmsEligibility(business, outreachType);
    if (!provisional.ok) {
      skipped.push({
        id,
        reason: provisional.reason,
        title: business.title ?? null,
      });
      continue;
    }

    eligible.push({ business, recipient: provisional.recipient });
  }

  return { skipped, eligible };
}

export function planOutreachSmsDeclineBatch(businessIds, businesses) {
  const byId = new Map((businesses ?? []).map((row) => [row.id, row]));
  const skipped = [];
  const eligible = [];

  for (const id of businessIds) {
    const business = byId.get(id);
    if (!business) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    const provisional = evaluateOutreachSmsDeclineEligibility(business);
    if (!provisional.ok) {
      skipped.push({
        id,
        reason: provisional.reason,
        title: business.title ?? null,
      });
      continue;
    }

    eligible.push({ business, recipient: provisional.recipient });
  }

  return { skipped, eligible };
}
