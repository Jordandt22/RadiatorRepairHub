import { normalizeClaimPhone } from "./claimPhone.js";

/** Matches the email scrape start slider. */
export const PHONE_LINE_TYPE_MIN_LIMIT = 50;
export const PHONE_LINE_TYPE_MAX_LIMIT = 500;
export const PHONE_LINE_TYPE_DEFAULT_LIMIT = 100;

/**
 * Twilio's REST guidance is about 100 requests per second. Lookup package
 * quotas are account-specific and return 429 when exceeded. Stay at 5
 * uncached lookups per second so claim checks still have room.
 */
export const PHONE_LINE_TYPE_MAX_PER_SECOND = 5;
export const PHONE_LINE_TYPE_MIN_INTERVAL_MS = 1000 / PHONE_LINE_TYPE_MAX_PER_SECOND;

/** A normal Twilio error is tried twice, then the row is marked checked. */
export const PHONE_LINE_TYPE_LOOKUP_ATTEMPTS = 2;

/** 429s back off and then stop the job instead of burning the rest of the list. */
export const PHONE_LINE_TYPE_RATE_LIMIT_ATTEMPTS = 4;
export const PHONE_LINE_TYPE_MAX_RETRY_AFTER_MS = 30_000;

export const PHONE_LINE_TYPE_JOB_LOCK_DURATION_MS = 1_200_000;
export const PHONE_LINE_TYPE_STALLED_INTERVAL_MS = 300_000;

const PUBLIC_PHONE_LINE_TYPE_LABELS = {
  landline: "Landline",
  mobile: "Mobile",
  fixedVoip: "VoIP",
  nonFixedVoip: "VoIP",
  tollFree: "Toll-free",
  personal: "Personal",
};

/** Customer-facing label. Unknown and non-callable types stay hidden. */
export function publicPhoneLineTypeLabel(lineType) {
  if (!lineType) return null;
  return PUBLIC_PHONE_LINE_TYPE_LABELS[lineType] ?? null;
}

export function groupBusinessesByClaimPhone(rows) {
  const groups = new Map();
  const invalidIds = [];

  for (const row of rows ?? []) {
    if (!row?.id) continue;
    const phoneE164 = normalizeClaimPhone(row.phone);
    if (!phoneE164) {
      invalidIds.push(row.id);
      continue;
    }
    const ids = groups.get(phoneE164) ?? [];
    ids.push(row.id);
    groups.set(phoneE164, ids);
  }

  return { groups, invalidIds };
}

export function isTwilioRateLimitError(error) {
  return error?.status === 429 || error?.code === 20429;
}

export function lookupRateLimitDelayMs(error, attempt) {
  const retryAfterMs = Number(error?.retryAfterSeconds) * 1000;
  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
    return Math.min(retryAfterMs, PHONE_LINE_TYPE_MAX_RETRY_AFTER_MS);
  }
  return Math.min(1000 * 2 ** attempt, PHONE_LINE_TYPE_MAX_RETRY_AFTER_MS);
}

/**
 * After a failed lookup, `attempt` is how many failures have happened so far.
 * Rate limits pause and then leave the number unchecked. Other errors are
 * marked checked after the second failure so one bad number cannot spin.
 */
export function nextLineTypeLookupStep(error, attempt) {
  if (isTwilioRateLimitError(error)) {
    if (attempt >= PHONE_LINE_TYPE_RATE_LIMIT_ATTEMPTS) {
      return { action: "stop" };
    }
    return {
      action: "retry",
      delayMs: lookupRateLimitDelayMs(error, attempt - 1),
    };
  }

  if (attempt >= PHONE_LINE_TYPE_LOOKUP_ATTEMPTS) {
    return { action: "giveUp" };
  }

  return { action: "retry", delayMs: 0 };
}

export function paceWaitMs(now, nextAllowedAt) {
  return Math.max(0, nextAllowedAt - now);
}

/** Cached lookups do not count toward the Twilio pace. */
export function nextAllowedAtAfterLookup(now, { cached = false } = {}) {
  if (cached) return now;
  return now + PHONE_LINE_TYPE_MIN_INTERVAL_MS;
}
