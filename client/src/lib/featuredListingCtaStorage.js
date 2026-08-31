const ANALYTICS_FEATURED_CTA_STORAGE_PREFIX =
  "rrh-analytics-featured-cta-dismissed:";
const LISTING_FEATURED_CTA_STORAGE_PREFIX =
  "rrh-listing-featured-cta-dismissed:";
export const FEATURED_CTA_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export function featuredCtaStorageKey(businessId, source = "analytics") {
  const prefix =
    source === "listing"
      ? LISTING_FEATURED_CTA_STORAGE_PREFIX
      : ANALYTICS_FEATURED_CTA_STORAGE_PREFIX;
  return `${prefix}${businessId}`;
}

export function isFeaturedCtaDismissed(businessId, source = "analytics") {
  if (!businessId) return false;
  try {
    const stored = localStorage.getItem(featuredCtaStorageKey(businessId, source));
    if (!stored) return false;
    const dismissedAt = new Date(stored).getTime();
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < FEATURED_CTA_SNOOZE_MS;
  } catch {
    return false;
  }
}

export function dismissFeaturedCta(businessId, source = "analytics") {
  if (!businessId) return;
  try {
    localStorage.setItem(
      featuredCtaStorageKey(businessId, source),
      new Date().toISOString()
    );
  } catch {
    // ignore
  }
}
