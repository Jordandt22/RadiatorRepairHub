import { logger } from "./logger.js";
import {
  stripe,
  getSubscriptionPeriodEnd,
  getSubscriptionPriceId,
} from "./stripe.js";
import {
  applyStripeSubscriptionStateRpc,
  listOwnerSubscriptions,
  listBusinessSubscriptions,
} from "../supabase/supabase.functions.js";
import {
  deleteCacheData,
  deleteCacheDataByPrefix,
  getBusinessByIdKey,
  getBusinessBySlugKey,
} from "../redis/redis.js";
import { supabase } from "../supabase/supabase.js";

const TERMINAL_STATUSES = new Set(["canceled", "incomplete_expired"]);

async function invalidateFeaturedCaches(businessId) {
  await deleteCacheDataByPrefix("FEATURED_BUSINESSES");
  await deleteCacheDataByPrefix("SEARCHED_BUSINESSES");

  if (!businessId) return;

  await deleteCacheData(getBusinessByIdKey(businessId).key);
  const { data } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", businessId)
    .maybeSingle();
  if (data?.slug) {
    await deleteCacheData(getBusinessBySlugKey(data.slug).key);
  }
}

async function markSubscriptionCanceledLocally(row, stripeSubscription) {
  const subscription = stripeSubscription || {
    id: row.stripe_subscription_id,
    status: "canceled",
    customer: row.stripe_customer_id,
    cancel_at_period_end: false,
    cancel_at: null,
  };

  const { error } = await applyStripeSubscriptionStateRpc({
    stripeSubscriptionId: subscription.id || row.stripe_subscription_id,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id || row.stripe_customer_id,
    stripePriceId: getSubscriptionPriceId(subscription) || row.stripe_price_id,
    businessId: row.business_id,
    ownerUid: row.owner_uid,
    status: "canceled",
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    cancelAtPeriodEnd: false,
  });

  if (error) {
    throw error;
  }
}

async function clearBusinessFeaturedFlag(businessId) {
  if (!businessId) return;
  await supabase
    .from("businesses")
    .update({ is_featured: false })
    .eq("id", businessId);
}

/**
 * Immediately cancel a Stripe subscription and sync local Featured state.
 */
export async function cancelFeaturedSubscriptionRecord(
  row,
  { reason = "account_deleted" } = {}
) {
  if (!row?.stripe_subscription_id) {
    if (row?.business_id) {
      await clearBusinessFeaturedFlag(row.business_id);
      await invalidateFeaturedCaches(row.business_id);
    }
    return { canceled: false, skipped: true };
  }

  if (TERMINAL_STATUSES.has(row.status)) {
    await clearBusinessFeaturedFlag(row.business_id);
    await invalidateFeaturedCaches(row.business_id);
    return { canceled: false, skipped: true };
  }

  let stripeSubscription = null;
  try {
    stripeSubscription = await stripe.subscriptions.cancel(
      row.stripe_subscription_id
    );
    logger.info(
      {
        reason,
        stripeSubscriptionId: row.stripe_subscription_id,
        businessId: row.business_id,
      },
      "Canceled Stripe Featured subscription"
    );
  } catch (error) {
    // Already gone in Stripe — still clear local Featured state.
    if (error?.code !== "resource_missing") {
      logger.error(
        {
          err: error,
          stripeSubscriptionId: row.stripe_subscription_id,
          businessId: row.business_id,
        },
        "Failed to cancel Stripe Featured subscription"
      );
      throw error;
    }
  }

  try {
    await markSubscriptionCanceledLocally(row, stripeSubscription);
  } catch (error) {
    logger.error(
      {
        err: error,
        stripeSubscriptionId: row.stripe_subscription_id,
        businessId: row.business_id,
      },
      "Failed to sync canceled Featured subscription locally"
    );
    await clearBusinessFeaturedFlag(row.business_id);
  }

  await invalidateFeaturedCaches(row.business_id);
  return { canceled: true, skipped: false };
}

export async function cancelFeaturedSubscriptionsForOwner(
  ownerUid,
  { reason = "account_deleted" } = {}
) {
  if (!ownerUid) return { canceled: 0, errors: [] };

  const { data, error } = await listOwnerSubscriptions(ownerUid);
  if (error) {
    throw error;
  }

  const errors = [];
  let canceled = 0;

  for (const row of data ?? []) {
    try {
      const result = await cancelFeaturedSubscriptionRecord(row, { reason });
      if (result.canceled) canceled += 1;
    } catch (err) {
      errors.push({
        businessId: row.business_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        message: err?.message || "Failed to cancel subscription",
      });
    }
  }

  return { canceled, errors };
}

export async function cancelFeaturedSubscriptionForBusiness(
  businessId,
  ownerUid,
  { reason = "listing_unclaimed" } = {}
) {
  if (!businessId) return { canceled: 0, errors: [] };

  const { data, error } = await listBusinessSubscriptions(businessId);
  if (error) {
    throw error;
  }

  const rows = data ?? [];
  if (!rows.length) {
    await clearBusinessFeaturedFlag(businessId);
    await invalidateFeaturedCaches(businessId);
    return { canceled: 0, errors: [], skipped: true };
  }

  const errors = [];
  let canceled = 0;

  for (const row of rows) {
    try {
      const result = await cancelFeaturedSubscriptionRecord(
        {
          ...row,
          business_id: row.business_id || businessId,
          owner_uid: row.owner_uid || ownerUid,
        },
        { reason }
      );
      if (result.canceled) canceled += 1;
    } catch (err) {
      errors.push({
        businessId,
        stripeSubscriptionId: row.stripe_subscription_id,
        message: err?.message || "Failed to cancel subscription",
      });
    }
  }

  return { canceled, errors };
}
