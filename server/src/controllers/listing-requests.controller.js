import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { insertListingRequest } from "../supabase/supabase.functions.js";
import { deleteCacheDataByPrefix } from "../redis/redis.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { resendClient } from "../resend/resend.js";
import {
  ADMIN_NEW_LISTING_REQUEST_MESSAGE,
  LISTING_REQUEST_RECEIVED_MESSAGE,
  SENDER_NAME,
} from "../lib/constants/messages.js";

const { SUPABASE_ERROR, YUP_ERROR, SERVER_ERROR } = errorCodes;

export const createListingRequest = async (req, res) => {
  const { businessName, email, phone, message } = req.body;

  const trimmedEmail = email.trim();
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

  const payload = {
    business_name: businessName.trim(),
    email: trimmedEmail,
    phone: phone?.trim() || null,
    message: message.trim(),
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
      message:
        "Thanks! We received your listing request and will review it soon.",
    })
  );
};
