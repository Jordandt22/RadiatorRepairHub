import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { getBusinessForListingSave } from "../supabase/supabase.functions.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { resendClient } from "../resend/resend.js";
import {
  LISTING_SAVE_MESSAGE,
  SENDER_NAME,
  buildBusinessClaimLink,
} from "../lib/constants/messages.js";
import {
  checkKey,
  getListingSaveCooldownKey,
  redisClient,
  setWithExactTtl,
} from "../redis/redis.js";

const { ROUTE_NOT_FOUND, YUP_ERROR, SERVER_ERROR, TOO_MANY_REQUESTS } =
  errorCodes;

const LISTING_SAVE_COOLDOWN_SECONDS = 60 * 60 * 24;

const getListingSaveCooldownRemaining = async (email, businessId) => {
  try {
    const { key } = getListingSaveCooldownKey(email, businessId);
    const ttl = await redisClient.ttl(checkKey(key));
    return ttl > 0 ? ttl : 0;
  } catch {
    return 0;
  }
};

const startListingSaveCooldown = async (email, businessId) => {
  try {
    const { key } = getListingSaveCooldownKey(email, businessId);
    await setWithExactTtl(key, LISTING_SAVE_COOLDOWN_SECONDS, true);
  } catch {
    // best-effort cooldown
  }
};

export const createListingSave = async (req, res) => {
  const { businessId, email, name } = req.body;
  const trimmedEmail = String(email || "").trim().toLowerCase();
  const trimmedName =
    typeof name === "string" && name.trim() ? name.trim() : null;

  const { data: business, error: businessError } =
    await getBusinessForListingSave(businessId);

  if (businessError || !business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The selected business could not be found.",
          businessError
        )
      );
  }

  const cooldownRemaining = await getListingSaveCooldownRemaining(
    trimmedEmail,
    businessId
  );
  if (cooldownRemaining > 0) {
    return res.status(429).json(
      customErrorHandler(
        TOO_MANY_REQUESTS,
        "You already emailed this listing to yourself today. Try again tomorrow."
      )
    );
  }

  const emailCheck = await verifyEmailReputation(trimmedEmail);

  if (!emailCheck.ok) {
    const { error: verifyError } = emailCheck;

    if (verifyError.type === "undeliverable") {
      return res.status(422).json(
        customErrorHandler(YUP_ERROR, {
          email: verifyError.message,
        })
      );
    }

    return res
      .status(503)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          verifyError.message || "Unable to verify email address right now.",
          verifyError.cause
        )
      );
  }

  const { SENDER_EMAIL, RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return res
      .status(503)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email delivery is temporarily unavailable. Please try again later."
        )
      );
  }

  const businessPageUrl = buildBusinessClaimLink(business.slug);
  const city = business.city;
  const state = business.state;
  const cityPageUrl =
    city?.slug && state?.code
      ? `https://radiatorrepairhub.com/state/${state.code}/city/${city.slug}`
      : null;

  const { error: sendError } = await resendClient().emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [trimmedEmail],
    subject: LISTING_SAVE_MESSAGE.subject(business.title),
    html: LISTING_SAVE_MESSAGE.html(trimmedName, business.title, {
      phone: business.phone,
      address: business.address,
      cityName: city?.name,
      stateCode: state?.code,
      businessPageUrl,
      cityPageUrl,
    }),
  });

  if (sendError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to send listing save email:", sendError);
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Unable to send the listing email right now. Please try again.",
          sendError
        )
      );
  }

  await startListingSaveCooldown(trimmedEmail, businessId);

  return res.status(200).json(
    successHandler({
      sent: true,
    })
  );
};
