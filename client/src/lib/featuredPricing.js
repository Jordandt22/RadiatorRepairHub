/**
 * Single source of truth for Featured listing pricing display copy.
 * Stripe price ID stays server-side (STRIPE_FEATURED_LISTING_PRICE_ID).
 */
export const FEATURED_YEARLY_PRICE = 149;
export const FEATURED_PRICE_CURRENCY = "USD";
export const FEATURED_BILLING_INTERVAL = "year";

/** Monthly equivalent for marketing copy (yearly ÷ 12). */
export const FEATURED_MONTHLY_EQUIVALENT =
  Math.round((FEATURED_YEARLY_PRICE / 12) * 100) / 100;

export const FEATURED_YEARLY_PRICE_LABEL = `$${FEATURED_YEARLY_PRICE}`;
export const FEATURED_YEARLY_PRICE_WITH_INTERVAL = `$${FEATURED_YEARLY_PRICE}/year`;
export const FEATURED_MONTHLY_EQUIVALENT_LABEL = `$${FEATURED_MONTHLY_EQUIVALENT.toFixed(2)}`;

export const FEATURED_PRICE_BLURB = `About ${FEATURED_MONTHLY_EQUIVALENT_LABEL}/month, billed yearly`;

/** Short plan-card bullets aligned with FEATURED_BENEFITS. */
export const FEATURED_PLAN_FEATURES = [
  "Everything in Claimed Listing",
  "Featured badge on your listing and cards",
  "Priority in search, state, city, category, and postal pages",
  "Up to 10 shop photos",
  "Full analytics: clicks, CTR, position, and contact stats",
  "Competitor insights for shops in your city",
];

export function featuredPriceValidUntil(fromDate = new Date()) {
  return `${fromDate.getFullYear() + 1}-12-31`;
}

export function formatFeaturedOfferPrice() {
  return FEATURED_YEARLY_PRICE.toFixed(2);
}
