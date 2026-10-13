import { randomBytes } from "crypto";
import { logger } from "./logger.js";
import {
  stripe,
  getSubscriptionPeriodEnd,
  getSubscriptionPriceId,
  isSubscriptionCancelScheduled,
  PARTNER_PRICE_ID,
} from "./stripe.js";
import { isPartnerClaimConflict, PARTNER_PLAN } from "./partnerCheckout.js";
import {
  applyStripeSubscriptionStateRpc,
  claimUnclaimedBusinessRpc,
  createAuthUser,
  generateRecoveryLink,
  getAuthUserIdByEmailRpc,
} from "../supabase/supabase.functions.js";
import {
  deleteCacheData,
  deleteCacheDataByPrefix,
  getBusinessByIdKey,
  getBusinessBySlugKey,
  getTopVerifiedBusinessesKey,
} from "../redis/redis.js";
import { supabase } from "../supabase/supabase.js";
import { resendClient } from "../resend/resend.js";
import {
  SENDER_NAME,
  ADMIN_PARTNER_PURCHASED_MESSAGE,
  ADMIN_PARTNER_CLAIM_CONFLICT_MESSAGE,
  OWNER_PARTNER_SET_PASSWORD_MESSAGE,
  OWNER_PARTNER_SIGN_IN_MESSAGE,
  buildBusinessClaimLink,
  getWebBaseUrl,
} from "./constants/messages.js";

function isEmailTakenError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "email_exists" ||
    message.includes("already been registered") ||
    message.includes("already registered")
  );
}

async function invalidatePartnerCaches(businessId) {
  await deleteCacheDataByPrefix("FEATURED_BUSINESSES");
  await deleteCacheDataByPrefix("SEARCHED_BUSINESSES");
  await deleteCacheData(getTopVerifiedBusinessesKey().key);
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

async function loadBusiness(businessId) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, title, slug, is_claimed, owner_uid")
    .eq("id", businessId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function resolveOwner({ email }) {
  const { data: existingId, error: lookupError } =
    await getAuthUserIdByEmailRpc(email);
  if (lookupError) throw lookupError;
  if (existingId) {
    return { ownerUid: existingId, createdAccount: false };
  }

  const password = randomBytes(32).toString("base64url");
  const { data, error } = await createAuthUser({
    email,
    password,
    emailConfirm: true,
  });

  if (data?.user?.id) {
    return { ownerUid: data.user.id, createdAccount: true };
  }

  if (error && isEmailTakenError(error)) {
    const { data: racedId, error: racedError } =
      await getAuthUserIdByEmailRpc(email);
    if (racedError) throw racedError;
    if (racedId) {
      return { ownerUid: racedId, createdAccount: false };
    }
  }

  throw error || new Error("Unable to create the Partner account.");
}

async function sendAdminEmail({ to, subject, html, logMessage, context }) {
  const { SENDER_EMAIL, RESEND_API_KEY, ADMIN_EMAIL } = process.env;
  if (!RESEND_API_KEY || !SENDER_EMAIL || !ADMIN_EMAIL) return;
  const { error } = await resendClient().emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [to || ADMIN_EMAIL],
    subject,
    html,
  });
  if (error) {
    logger.error({ err: error, ...context }, logMessage);
  }
}

async function sendOwnerEmail({ to, subject, html, context }) {
  const { SENDER_EMAIL, RESEND_API_KEY, TEST_RECIPIENT_EMAIL } = process.env;
  const isDev = process.env.NODE_ENV === "development";
  if (!RESEND_API_KEY || !SENDER_EMAIL) return;
  if (isDev && !TEST_RECIPIENT_EMAIL) return;
  const recipient = isDev ? TEST_RECIPIENT_EMAIL : to;
  if (!recipient) return;
  const { error } = await resendClient().emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [recipient],
    subject,
    html,
  });
  if (error) {
    logger.error({ err: error, ...context }, "Failed to send Partner owner email");
  }
}

/**
 * Creates or finds the owner, claims an unclaimed listing, and applies the
 * Partner subscription. A claim conflict is reported and does not throw, so
 * Stripe will not retry a payment that cannot take the listing.
 */
export async function fulfillPartnerCheckout({ session, subscription }) {
  const businessId =
    session?.metadata?.business_id || session?.client_reference_id || null;
  const email = String(
    session?.customer_details?.email || session?.customer_email || ""
  )
    .trim()
    .toLowerCase();
  const phone =
    typeof session?.customer_details?.phone === "string"
      ? session.customer_details.phone.trim()
      : "";

  if (!businessId) {
    throw new Error("Partner checkout is missing a business id.");
  }
  if (!email) {
    throw new Error("Partner checkout is missing a customer email.");
  }

  const business = await loadBusiness(businessId);
  if (!business) {
    throw new Error("Partner checkout business was not found.");
  }

  const { data: existingOwnerId, error: lookupError } =
    await getAuthUserIdByEmailRpc(email);
  if (lookupError) throw lookupError;

  if (
    isPartnerClaimConflict({
      business,
      ownerUid: existingOwnerId,
    })
  ) {
    const stripeCustomerId =
      typeof subscription?.customer === "string"
        ? subscription.customer
        : subscription?.customer?.id || null;
    await sendAdminEmail({
      subject: ADMIN_PARTNER_CLAIM_CONFLICT_MESSAGE.subject(business.title),
      html: ADMIN_PARTNER_CLAIM_CONFLICT_MESSAGE.html(business.title, {
        email,
        businessPageUrl: buildBusinessClaimLink(business.slug),
        stripeSubscriptionId: subscription?.id || null,
        stripeCustomerId,
      }),
      logMessage: "Failed to send Partner claim-conflict email",
      context: { businessId, subscriptionId: subscription?.id },
    });
    return { conflict: true, businessId, ownerUid: existingOwnerId };
  }

  const { ownerUid, createdAccount } = existingOwnerId
    ? { ownerUid: existingOwnerId, createdAccount: false }
    : await resolveOwner({ email });

  const { data: claimed, error: claimError } = await claimUnclaimedBusinessRpc(
    businessId,
    ownerUid,
    phone || null
  );
  if (claimError) throw claimError;
  if (!claimed) {
    await sendAdminEmail({
      subject: ADMIN_PARTNER_CLAIM_CONFLICT_MESSAGE.subject(business.title),
      html: ADMIN_PARTNER_CLAIM_CONFLICT_MESSAGE.html(business.title, {
        email,
        businessPageUrl: buildBusinessClaimLink(business.slug),
        stripeSubscriptionId: subscription?.id || null,
        stripeCustomerId:
          typeof subscription?.customer === "string"
            ? subscription.customer
            : subscription?.customer?.id || null,
      }),
      logMessage: "Failed to send Partner claim-conflict email",
      context: { businessId, subscriptionId: subscription?.id },
    });
    return { conflict: true, businessId, ownerUid };
  }

  const metadata = {
    ...(subscription?.metadata || {}),
    business_id: businessId,
    owner_uid: ownerUid,
    plan: PARTNER_PLAN,
    business_title: String(business.title || "Partner listing").slice(0, 500),
  };

  await stripe.subscriptions.update(subscription.id, { metadata });

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  const { error: applyError } = await applyStripeSubscriptionStateRpc({
    stripeSubscriptionId: subscription.id,
    stripeCustomerId,
    stripePriceId: getSubscriptionPriceId(subscription) || PARTNER_PRICE_ID,
    businessId,
    ownerUid,
    status: subscription.status,
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    cancelAtPeriodEnd: isSubscriptionCancelScheduled(subscription),
  });
  if (applyError) throw applyError;

  await invalidatePartnerCaches(businessId);

  const baseUrl = getWebBaseUrl();
  const businessPageUrl = buildBusinessClaimLink(business.slug);
  const signInUrl = `${baseUrl}/signin`;

  try {
    if (createdAccount) {
      const { data: linkData, error: linkError } = await generateRecoveryLink({
        email,
        redirectTo: `${baseUrl}/reset-password`,
      });
      const setPasswordUrl = linkData?.properties?.action_link || null;
      if (linkError || !setPasswordUrl) {
        throw linkError || new Error("Missing Partner password link.");
      }
      await sendOwnerEmail({
        to: email,
        subject: OWNER_PARTNER_SET_PASSWORD_MESSAGE.subject(business.title),
        html: OWNER_PARTNER_SET_PASSWORD_MESSAGE.html(business.title, {
          setPasswordUrl,
          businessPageUrl,
          signInUrl,
        }),
        context: { businessId, ownerUid },
      });
    } else {
      await sendOwnerEmail({
        to: email,
        subject: OWNER_PARTNER_SIGN_IN_MESSAGE.subject(business.title),
        html: OWNER_PARTNER_SIGN_IN_MESSAGE.html(business.title, {
          signInUrl,
          businessPageUrl,
        }),
        context: { businessId, ownerUid },
      });
    }

    await sendAdminEmail({
      subject: ADMIN_PARTNER_PURCHASED_MESSAGE.subject(business.title),
      html: ADMIN_PARTNER_PURCHASED_MESSAGE.html(business.title, {
        email,
        phone: phone || null,
        businessPageUrl,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId,
        status: subscription.status,
        createdAccount,
      }),
      logMessage: "Failed to send admin Partner purchase email",
      context: { businessId, subscriptionId: subscription.id },
    });
  } catch (emailError) {
    logger.error(
      { err: emailError, businessId, ownerUid },
      "Partner purchase email failed"
    );
  }

  return { conflict: false, businessId, ownerUid, createdAccount };
}
