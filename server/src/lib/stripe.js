import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(stripeSecretKey);

export const FEATURED_PRICE_ID = process.env.STRIPE_FEATURED_LISTING_PRICE_ID;

export const LIVE_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
];

export const FEATURED_BLOCKING_STATUSES = [
  ...LIVE_SUBSCRIPTION_STATUSES,
  "incomplete",
];

export function getSubscriptionPeriodEnd(subscription) {
  const itemEnd = subscription?.items?.data?.[0]?.current_period_end;
  const rootEnd = subscription?.current_period_end;
  const seconds = itemEnd || rootEnd;
  if (!seconds) return null;
  return new Date(Number(seconds) * 1000).toISOString();
}

export function getSubscriptionPriceId(subscription) {
  return (
    subscription?.items?.data?.[0]?.price?.id ||
    subscription?.plan?.id ||
    null
  );
}

/**
 * Flexible billing mode (Stripe API 2025+) sets cancel_at on portal
 * cancellations and leaves cancel_at_period_end false. Treat either as
 * "scheduled to cancel" for Featured billing UI/state.
 */
export function isSubscriptionCancelScheduled(subscription) {
  if (!subscription) return false;
  if (subscription.cancel_at_period_end) return true;
  return Boolean(subscription.cancel_at);
}
