import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { insertContactInquiry } from "../supabase/supabase.functions.js";
import { deleteCacheDataByPrefix } from "../redis/redis.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { resendClient } from "../resend/resend.js";
import {
  ADMIN_NEW_CONTACT_INQUIRY_MESSAGE,
  CONTACT_INQUIRY_RECEIVED_MESSAGE,
  SENDER_NAME,
} from "../lib/constants/messages.js";

const { SUPABASE_ERROR, YUP_ERROR, SERVER_ERROR } = errorCodes;

export const createContactInquiry = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

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
    name: name.trim(),
    email: trimmedEmail,
    phone: phone?.trim() || null,
    subject,
    message: message.trim(),
  };

  const { data, error } = await insertContactInquiry(payload);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error saving your message.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_INQUIRIES");

  const { SENDER_EMAIL, RESEND_API_KEY, ADMIN_EMAIL, INTERNAL_CLIENT_URL } =
    process.env;

  if (RESEND_API_KEY && SENDER_EMAIL) {
    const { error: confirmSendError } = await resendClient().emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [trimmedEmail],
      subject: CONTACT_INQUIRY_RECEIVED_MESSAGE.subject,
      html: CONTACT_INQUIRY_RECEIVED_MESSAGE.html(payload.name, {
        subject: payload.subject,
        message: payload.message,
      }),
    });

    if (confirmSendError && process.env.NODE_ENV === "development") {
      console.error(
        "Failed to send contact inquiry confirmation email:",
        confirmSendError
      );
    }

    if (ADMIN_EMAIL) {
      const adminQueueBase = (INTERNAL_CLIENT_URL || "").replace(/\/$/, "");
      const adminQueueUrl = adminQueueBase
        ? `${adminQueueBase}/inquiries?tab=pending`
        : null;

      const { error: adminSendError } = await resendClient().emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: ADMIN_NEW_CONTACT_INQUIRY_MESSAGE.subject(payload.subject),
        html: ADMIN_NEW_CONTACT_INQUIRY_MESSAGE.html({
          name: payload.name,
          email: trimmedEmail,
          phone: payload.phone,
          subject: payload.subject,
          message: payload.message,
          adminQueueUrl,
        }),
      });

      if (adminSendError && process.env.NODE_ENV === "development") {
        console.error(
          "Failed to send contact inquiry admin email:",
          adminSendError
        );
      }
    }
  }

  return res.status(201).json(
    successHandler({
      contactInquiryId: data.contact_inquiry_id,
      message: "Thanks! We received your message and will get back to you soon.",
    })
  );
};
