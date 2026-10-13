/** Statuses that occupy the one-live-subscription slot on a business. */
export const PARTNER_CHECKOUT_BLOCKING_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
];

/**
 * Stripe requires expires_at at least 30 minutes out. One extra minute covers
 * the time between building the timestamp and Stripe accepting the session.
 */
export const PARTNER_CHECKOUT_TTL_SECONDS = 31 * 60;

export const PARTNER_PLAN = "partner";

export function getPartnerPriceId() {
  return (
    process.env.STRIPE_PARTNER_LISTING_PRICE_ID ||
    process.env.STRIPE_PARTNERED_LISTING_PRICE_ID ||
    ""
  );
}

export function partnerCheckoutExpiresAt(nowMs = Date.now()) {
  return Math.floor(nowMs / 1000) + PARTNER_CHECKOUT_TTL_SECONDS;
}

export function isPartnerCheckout({ plan, priceId, partnerPriceId }) {
  if (plan === PARTNER_PLAN) return true;
  return Boolean(partnerPriceId) && priceId === partnerPriceId;
}

/**
 * Why an admin cannot open a Partner checkout session for this listing.
 * Returns null when the listing is eligible.
 */
export function partnerCheckoutBlockReason(business, liveSubscription) {
  if (!business) return "not_found";
  if (business.is_claimed) return "claimed";
  if (
    liveSubscription &&
    PARTNER_CHECKOUT_BLOCKING_STATUSES.includes(liveSubscription.status)
  ) {
    return "live_subscription";
  }
  return null;
}

/**
 * True when the listing is already claimed by a different account, so payment
 * must not take ownership.
 */
export function isPartnerClaimConflict({ business, ownerUid }) {
  if (!business?.is_claimed) return false;
  if (!ownerUid) return true;
  return business.owner_uid !== ownerUid;
}
