import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { getWebBaseUrl } from "../lib/constants/messages.js";
import { partnerAgreementUrl } from "../lib/partnerAgreement.js";
import {
  stripe,
  PARTNER_PRICE_ID,
} from "../lib/stripe.js";
import {
  PARTNER_PLAN,
  partnerCheckoutBlockReason,
  partnerCheckoutExpiresAt,
} from "../lib/partnerCheckout.js";
import {
  getAdminBusinessById,
  getLiveBusinessSubscription,
} from "../supabase/supabase.functions.js";

const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR, ROUTE_NOT_FOUND } =
  errorCodes;

const BLOCK_MESSAGES = {
  claimed: "This listing is already claimed.",
  live_subscription: "This listing already has a subscription.",
};

export const createPartnerCheckoutSession = async (req, res) => {
  if (!PARTNER_PRICE_ID) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Partner listing checkout is not configured."
        )
      );
  }

  const businessId = req.params?.id;
  const { data: business, error: businessError } =
    await getAdminBusinessById(businessId);

  if (businessError) {
    if (businessError.code === "PGRST116") {
      return res
        .status(404)
        .json(customErrorHandler(ROUTE_NOT_FOUND, "Business not found."));
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error loading this listing.",
          businessError
        )
      );
  }

  const { data: liveSub, error: liveError } =
    await getLiveBusinessSubscription(businessId);
  if (liveError && liveError.code !== "PGRST116") {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error checking subscription status.",
          liveError
        )
      );
  }

  const blockReason = partnerCheckoutBlockReason(business, liveSub);
  if (blockReason === "not_found") {
    return res
      .status(404)
      .json(customErrorHandler(ROUTE_NOT_FOUND, "Business not found."));
  }
  if (blockReason) {
    return res
      .status(409)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          BLOCK_MESSAGES[blockReason] || "This listing cannot start Partner checkout."
        )
      );
  }

  const webUrl = getWebBaseUrl();
  const businessTitle =
    typeof business.title === "string" && business.title.trim()
      ? business.title.trim()
      : "Partner listing";
  const metadata = {
    business_id: businessId,
    plan: PARTNER_PLAN,
    business_title: businessTitle.slice(0, 500),
  };

  const agreementUrl = partnerAgreementUrl(webUrl);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: businessId,
    line_items: [{ price: PARTNER_PRICE_ID, quantity: 1 }],
    success_url: `${webUrl}/checkout/partner/success`,
    cancel_url: `${webUrl}/checkout/partner/cancel`,
    expires_at: partnerCheckoutExpiresAt(),
    phone_number_collection: { enabled: true },
    billing_address_collection: "required",
    automatic_tax: { enabled: true },
    managed_payments: { enabled: false },
    allow_promotion_codes: true,
    metadata,
    custom_text: {
      submit: {
        message: `By confirming, you agree to the RadiatorRepairHub Partner Agreement at ${agreementUrl} and our Terms of Service.`,
      },
    },
    subscription_data: {
      metadata,
      description: `Partner Listing: ${businessTitle}`.slice(0, 500),
    },
  });

  if (!session?.url) {
    return res
      .status(500)
      .json(
        customErrorHandler(SERVER_ERROR, "Unable to start Partner checkout.")
      );
  }

  return res.status(200).json(
    successHandler({
      url: session.url,
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
    })
  );
};
