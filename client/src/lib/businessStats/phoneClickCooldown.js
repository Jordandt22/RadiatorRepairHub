/** Ignore repeat phone-click stats from the same listing for this long. */
export const PHONE_CLICK_COOLDOWN_MS = 3000;

const lastRecordedAt = new Map();

/**
 * Runs `record` on the first tap for a business, then skips further stats
 * until the cooldown ends. Callers must leave the `tel:` link itself alone.
 */
export function recordPhoneClick(businessId, record) {
  if (typeof record !== "function") return;

  if (!businessId) {
    record();
    return;
  }

  const key = String(businessId);
  const now = Date.now();
  const previous = lastRecordedAt.get(key) ?? 0;
  if (now - previous < PHONE_CLICK_COOLDOWN_MS) return;

  lastRecordedAt.set(key, now);
  record();
}
