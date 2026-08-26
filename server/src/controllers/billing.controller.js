import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { getWebBaseUrl } from "../lib/constants/messages.js";
import {
  stripe,
  FEATURED_PRICE_ID,
  getSubscriptionPeriodEnd,
  getSubscriptionPriceId,
  isSubscriptionCancelScheduled,
} from "../lib/stripe.js";
import {
  getOwnedBusiness,
  getUserStripeCustomerId,
  setUserStripeCustomerId,
  getLiveBusinessSubscription,
  listOwnerSubscriptions,
  applyStripeSubscriptionStateRpc,
} from "../supabase/supabase.functions.js";

const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR } = errorCodes;

async function requireOwner(req, res) {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
    return null;
  }
  return { ownerUid, accessToken };
}

export const createCheckoutSession = async (req, res) => {
  const auth = await requireOwner(req, res);
  if (!auth) return;

  if (!FEATURED_PRICE_ID) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Featured listing checkout is not configured."
        )
      );
  }

  const { businessId } = req.body;
  const { ownerUid, accessToken } = auth;

  const { data: business, error: businessError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );
  if (businessError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying your listing.",
          businessError
        )
      );
  }
  if (!business?.is_claimed) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You can only upgrade a claimed listing you own."
        )
      );
  }
  if (business.is_featured) {
    return res
      .status(409)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "This listing is already Featured."
        )
      );
  }

  const { data: liveSub, error: liveError } = await getLiveBusinessSubscription(
    businessId
  );
  if (liveError && liveError.code !== "PGRST116") {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error checking Featured status.",
          liveError
        )
      );
  }
  if (liveSub || liveError?.code === "PGRST116") {
    return res
      .status(409)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "This listing already has a Featured subscription."
        )
      );
  }

  const { data: userRow, error: userError } = await getUserStripeCustomerId(
    ownerUid
  );
  if (userError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error loading your billing profile.",
          userError
        )
      );
  }

  let stripeCustomerId = userRow?.stripe_customer_id || null;
  const email =
    typeof req.user?.email === "string" ? req.user.email.trim() : "";

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: email || undefined,
      metadata: { owner_uid: ownerUid },
    });
    stripeCustomerId = customer.id;
    const { error: saveError } = await setUserStripeCustomerId(
      ownerUid,
      stripeCustomerId
    );
    if (saveError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error saving your billing profile.",
            saveError
          )
        );
    }
  }

  const webUrl = getWebBaseUrl();
  const metadata = {
    business_id: businessId,
    owner_uid: ownerUid,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    client_reference_id: businessId,
    line_items: [{ price: FEATURED_PRICE_ID, quantity: 1 }],
    success_url: `${webUrl}/checkout/success`,
    cancel_url: `${webUrl}/checkout/cancel`,
    billing_address_collection: "required",
    automatic_tax: { enabled: true },
    customer_update: { address: "auto", name: "auto" },
    managed_payments: { enabled: false },
    metadata,
    subscription_data: { metadata },
  });

  if (!session?.url) {
    return res
      .status(500)
      .json(
        customErrorHandler(SERVER_ERROR, "Unable to start Stripe checkout.")
      );
  }

  return res.status(200).json(successHandler({ url: session.url }));
};

export const createPortalSession = async (req, res) => {
  const auth = await requireOwner(req, res);
  if (!auth) return;

  const { ownerUid } = auth;
  const { data: userRow, error: userError } = await getUserStripeCustomerId(
    ownerUid
  );
  if (userError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error loading your billing profile.",
          userError
        )
      );
  }

  const stripeCustomerId = userRow?.stripe_customer_id;
  if (!stripeCustomerId) {
    return res
      .status(400)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "No billing profile is set up yet."
        )
      );
  }

  const webUrl = getWebBaseUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${webUrl}/settings?tab=payments`,
  });

  if (!session?.url) {
    return res
      .status(500)
      .json(
        customErrorHandler(SERVER_ERROR, "Unable to open the billing portal.")
      );
  }

  return res.status(200).json(successHandler({ url: session.url }));
};

export const listBillingSubscriptions = async (req, res) => {
  const auth = await requireOwner(req, res);
  if (!auth) return;

  const { data, error } = await listOwnerSubscriptions(auth.ownerUid);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching your subscriptions.",
          error
        )
      );
  }

  // Refresh cancel/status from Stripe so portal cancellations (flexible
  // billing uses cancel_at, not cancel_at_period_end) stay accurate even if
  // a webhook was missed or used the older flag.
  const rows = data ?? [];
  await Promise.all(
    rows.map(async (row) => {
      const stripeSubscriptionId = row.stripe_subscription_id;
      if (!stripeSubscriptionId) return;
      try {
        const subscription = await stripe.subscriptions.retrieve(
          stripeSubscriptionId,
          { expand: ["items.data.price"] }
        );
        const cancelAtPeriodEnd = isSubscriptionCancelScheduled(subscription);
        const status = subscription.status;
        const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
        const needsUpdate =
          row.status !== status ||
          Boolean(row.cancel_at_period_end) !== cancelAtPeriodEnd;

        if (!needsUpdate) return;

        await applyStripeSubscriptionStateRpc({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id,
          stripePriceId: getSubscriptionPriceId(subscription),
          businessId: row.business_id,
          ownerUid: auth.ownerUid,
          status,
          currentPeriodEnd,
          cancelAtPeriodEnd,
        });

        row.status = status;
        row.cancel_at_period_end = cancelAtPeriodEnd;
        if (currentPeriodEnd) {
          row.current_period_end = currentPeriodEnd;
        }
      } catch {
        // Keep stored row if Stripe retrieve fails.
      }
    })
  );

  const subscriptions = rows.map((row) => ({
    id: row.id,
    businessId: row.business_id,
    businessTitle: row.business?.title ?? "Listing",
    businessSlug: row.business?.slug ?? null,
    status: row.status,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    createdAt: row.created_at,
  }));

  return res.status(200).json(successHandler({ subscriptions }));
};
