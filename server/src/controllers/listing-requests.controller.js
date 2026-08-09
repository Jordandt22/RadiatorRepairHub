import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  findPendingListingRequestByGoogleMapsUrl,
  findPendingListingRequestByPlaceId,
  getBusinessByPlaceId,
  insertListingRequest,
} from "../supabase/supabase.functions.js";
import { deleteCacheDataByPrefix } from "../redis/redis.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { resendClient } from "../resend/resend.js";
import {
  ADMIN_NEW_LISTING_REQUEST_MESSAGE,
  LISTING_REQUEST_RECEIVED_MESSAGE,
  SENDER_NAME,
  buildBusinessClaimLink,
} from "../lib/constants/messages.js";
import { normalizeGoogleMapsUrl } from "../lib/normalizeGoogleMapsUrl.js";
import { resolvePlaceIdFromGoogleMapsUrl } from "../lib/resolvePlaceIdFromGoogleMapsUrl.js";

const { SUPABASE_ERROR, YUP_ERROR, SERVER_ERROR } = errorCodes;

export const createListingRequest = async (req, res) => {
  const { businessName, email, phone, googleMapsUrl, message } = req.body;

  const trimmedEmail = email.trim();
  const trimmedBusinessName = businessName.trim();
  const normalizedMapsUrl = normalizeGoogleMapsUrl(googleMapsUrl);

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

  const { data: existingPendingByUrl, error: existingUrlError } =
    await findPendingListingRequestByGoogleMapsUrl(normalizedMapsUrl);

  if (existingUrlError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error checking for existing listing requests.",
          existingUrlError
        )
      );
  }

  if (existingPendingByUrl) {
    return res.status(409).json(
      customErrorHandler(YUP_ERROR, {
        googleMapsUrl:
          "We already have a pending listing request for this Google link. We'll review it soon.",
      })
    );
  }

  const { placeId, source: placeIdSource } =
    await resolvePlaceIdFromGoogleMapsUrl({
      url: normalizedMapsUrl,
      businessName: trimmedBusinessName,
    });

  if (process.env.NODE_ENV === "development") {
    console.log("Listing request place_id resolve:", {
      placeId,
      source: placeIdSource,
    });
  }

  if (placeId) {
    const { data: existingBusiness, error: businessError } =
      await getBusinessByPlaceId(placeId);

    if (businessError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error checking for an existing listing.",
            businessError
          )
        );
    }

    if (existingBusiness) {
      const listingUrl = buildBusinessClaimLink(existingBusiness.slug);
      return res.status(409).json(
        customErrorHandler(YUP_ERROR, {
          googleMapsUrl: existingBusiness.slug
            ? `This business is already listed on RadiatorRepairHub. View it here: ${listingUrl}`
            : "This business is already listed on RadiatorRepairHub.",
        })
      );
    }

    const { data: existingPendingByPlace, error: existingPlaceError } =
      await findPendingListingRequestByPlaceId(placeId);

    if (existingPlaceError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error checking for existing listing requests.",
            existingPlaceError
          )
        );
    }

    if (existingPendingByPlace) {
      return res.status(409).json(
        customErrorHandler(YUP_ERROR, {
          googleMapsUrl:
            "We already have a pending listing request for this business. We'll review it soon.",
        })
      );
    }
  }

  const payload = {
    business_name: trimmedBusinessName,
    email: trimmedEmail,
    phone: phone?.trim() || null,
    google_maps_url: normalizedMapsUrl,
    place_id: placeId || null,
    message: message?.trim() || null,
  };

  const { data, error } = await insertListingRequest(payload);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error saving your listing request.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("LISTING_REQUESTS");

  const { SENDER_EMAIL, RESEND_API_KEY, ADMIN_EMAIL, INTERNAL_CLIENT_URL } =
    process.env;

  if (RESEND_API_KEY && SENDER_EMAIL) {
    const { error: confirmSendError } = await resendClient().emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [trimmedEmail],
      subject: LISTING_REQUEST_RECEIVED_MESSAGE.subject,
      html: LISTING_REQUEST_RECEIVED_MESSAGE.html(payload.business_name, {
        googleMapsUrl: payload.google_maps_url,
        message: payload.message,
      }),
    });

    if (confirmSendError && process.env.NODE_ENV === "development") {
      console.error(
        "Failed to send listing request confirmation email:",
        confirmSendError
      );
    }

    if (ADMIN_EMAIL) {
      const adminQueueBase = (INTERNAL_CLIENT_URL || "").replace(/\/$/, "");
      const adminQueueUrl = adminQueueBase
        ? `${adminQueueBase}/get-listed-requests?tab=pending`
        : null;

      const { error: adminSendError } = await resendClient().emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: ADMIN_NEW_LISTING_REQUEST_MESSAGE.subject(payload.business_name),
        html: ADMIN_NEW_LISTING_REQUEST_MESSAGE.html({
          businessName: payload.business_name,
          email: trimmedEmail,
          phone: payload.phone,
          googleMapsUrl: payload.google_maps_url,
          placeId: payload.place_id,
          message: payload.message,
          adminQueueUrl,
        }),
      });

      if (adminSendError && process.env.NODE_ENV === "development") {
        console.error(
          "Failed to send listing request admin email:",
          adminSendError
        );
      }
    }
  }

  return res.status(201).json(
    successHandler({
      listingRequestId: data.listing_request_id,
      placeId: payload.place_id,
      message:
        "Thanks! We received your listing request and will review it soon.",
    })
  );
};
