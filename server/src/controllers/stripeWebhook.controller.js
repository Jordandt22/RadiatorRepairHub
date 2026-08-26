import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";
import { logger } from "../lib/logger.js";
import {
  stripe,
  getSubscriptionPeriodEnd,
  getSubscriptionPriceId,
  isSubscriptionCancelScheduled,
} from "../lib/stripe.js";
import {
  applyStripeSubscriptionStateRpc,
} from "../supabase/supabase.functions.js";
import {
  deleteCacheData,
  deleteCacheDataByPrefix,
  getBusinessByIdKey,
  getBusinessBySlugKey,
} from "../redis/redis.js";
import { supabase, adminAuthClient } from "../supabase/supabase.js";
import { resendClient } from "../resend/resend.js";
import {
  SENDER_NAME,
  ADMIN_FEATURED_PURCHASED_MESSAGE,
  buildBusinessClaimLink,
} from "../lib/constants/messages.js";

const { SERVER_ERROR } = errorCodes;

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

function parseUuid(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

async function applySubscription(subscription, fallback = {}) {
  const metadata = subscription?.metadata || {};
  const businessId =
    parseUuid(metadata.business_id) || parseUuid(fallback.businessId);
  const ownerUid =
    parseUuid(metadata.owner_uid) || parseUuid(fallback.ownerUid);

  const { error } = await applyStripeSubscriptionStateRpc({
    stripeSubscriptionId: subscription.id,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id,
    stripePriceId: getSubscriptionPriceId(subscription),
    businessId,
    ownerUid,
    status: subscription.status,
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    cancelAtPeriodEnd: isSubscriptionCancelScheduled(subscription),
  });

  if (error) {
    throw error;
  }

  await invalidateFeaturedCaches(businessId);

  return { businessId, ownerUid };
}

async function retrieveSubscription(subscriptionId) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });
}

async function notifyAdminFeaturedPurchase({
  businessId,
  ownerUid,
  subscription,
  customerEmail,
}) {
  const { SENDER_EMAIL, RESEND_API_KEY, ADMIN_EMAIL } = process.env;
  if (!RESEND_API_KEY || !SENDER_EMAIL || !ADMIN_EMAIL) return;

  let businessTitle = null;
  let businessSlug = null;
  if (businessId) {
    const { data: business } = await supabase
      .from("businesses")
      .select("title, slug")
      .eq("id", businessId)
      .maybeSingle();
    businessTitle = business?.title ?? null;
    businessSlug = business?.slug ?? null;
  }

  let ownerEmail =
    typeof customerEmail === "string" ? customerEmail.trim() : "";
  if (!ownerEmail && ownerUid) {
    try {
      const { data: authData, error: authError } =
        await adminAuthClient.getUserById(ownerUid);
      if (!authError) {
        ownerEmail = authData?.user?.email ?? "";
      }
    } catch (err) {
      logger.warn(
        { err, ownerUid },
        "Could not load owner email for Featured purchase admin notice"
      );
    }
  }

  const stripeCustomerId =
    typeof subscription?.customer === "string"
      ? subscription.customer
      : subscription?.customer?.id || null;

  const businessPageUrl = businessSlug
    ? buildBusinessClaimLink(businessSlug)
    : null;

  const { error: adminSendError } = await resendClient().emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [ADMIN_EMAIL],
    subject: ADMIN_FEATURED_PURCHASED_MESSAGE.subject(businessTitle),
    html: ADMIN_FEATURED_PURCHASED_MESSAGE.html(businessTitle, {
      email: ownerEmail || null,
      businessPageUrl,
      stripeSubscriptionId: subscription?.id || null,
      stripeCustomerId,
      status: subscription?.status || null,
    }),
  });

  if (adminSendError) {
    logger.error(
      { err: adminSendError, businessId, subscriptionId: subscription?.id },
      "Failed to send admin Featured purchase email"
    );
  }
}

export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res
      .status(500)
      .json(
        customErrorHandler(SERVER_ERROR, "Stripe webhook secret is not configured.")
      );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    logger.error({ err: error }, "Stripe webhook signature verification failed");
    return res.status(400).json({ received: false });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await retrieveSubscription(session.subscription);
        const applied = await applySubscription(subscription, {
          businessId: session.metadata?.business_id || session.client_reference_id,
          ownerUid: session.metadata?.owner_uid,
        });

        // Purchase notification only on checkout completion (not renewals).
        try {
          await notifyAdminFeaturedPurchase({
            businessId: applied.businessId,
            ownerUid: applied.ownerUid,
            subscription,
            customerEmail: session.customer_details?.email || session.customer_email,
          });
        } catch (emailError) {
          logger.error(
            { err: emailError, type: event.type },
            "Admin Featured purchase email failed"
          );
        }
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.created"
    ) {
      const object = event.data.object;
      const subscription =
        object.items?.data?.length
          ? object
          : await retrieveSubscription(object.id);
      await applySubscription(subscription);
    } else if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id || invoice.parent?.subscription_details?.subscription;
      if (subscriptionId) {
        const subscription = await retrieveSubscription(subscriptionId);
        await applySubscription(subscription);
      }
    }
  } catch (error) {
    logger.error({ err: error, type: event.type }, "Stripe webhook handler failed");
    return res
      .status(500)
      .json(customErrorHandler(SERVER_ERROR, "Webhook handler failed.", error));
  }

  return res.status(200).json({ received: true });
};
