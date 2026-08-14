import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  getBusinessById,
  insertContactMessage,
  markContactMessagesSentAndConfirmed,
} from "../supabase/supabase.functions.js";
import { deleteCacheDataByPrefix } from "../redis/redis.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { resendClient } from "../resend/resend.js";
import { sendFreeLeadToBusiness } from "../lib/contactMessageSend.js";
import {
  UNDER_REVIEW_MESSAGE,
  MESSAGE_ON_ITS_WAY,
  ADMIN_NEW_CONTACT_MESSAGE,
  SENDER_NAME,
} from "../lib/constants/messages.js";

const { SUPABASE_ERROR, ROUTE_NOT_FOUND, YUP_ERROR, SERVER_ERROR } = errorCodes;

const URGENCY_MAP = {
  asap: 1,
  "can-wait": 2,
};

export const createContactMessage = async (req, res) => {
  const {
    businessId,
    contactType = "need_service",
    name,
    email,
    phone,
    vehicleModel,
    issue,
    urgency,
    additionalDetails,
  } = req.body;
  const isQuestions = contactType === "questions";

  let business = null;
  let businessName = null;

  // Check Business
  if (businessId) {
    const { data: businessData, error: businessError } =
      await getBusinessById(businessId);

    if (businessError || !businessData) {
      return res
        .status(404)
        .json(
          customErrorHandler(
            ROUTE_NOT_FOUND,
            "The selected business could not be found."
          )
        );
    }

    business = businessData;
    businessName = business.title ?? null;
  }

  // Verify Email
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

  const urgencyValue = isQuestions ? null : URGENCY_MAP[urgency];
  const trimmedName = name.trim();
  const trimmedPhone = phone?.trim() || "";
  const trimmedVehicle = isQuestions ? null : vehicleModel?.trim() || null;
  const trimmedDetails = additionalDetails?.trim() || null;
  const issueValue = isQuestions ? null : issue;

  // Insert Contact Message
  const { data, error } = await insertContactMessage({
    business_id: businessId || null,
    contact_type: contactType,
    name: trimmedName,
    email: trimmedEmail,
    phone: trimmedPhone,
    vehicle: trimmedVehicle,
    issue: issueValue,
    urgency: urgencyValue,
    additional_details: trimmedDetails,
  });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error saving your contact message.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageId = data.contact_message_id;
  const businessEmail =
    typeof business?.email === "string" ? business.email.trim() : "";

  let autoSent = false;

  const messageForLead = {
    name: trimmedName,
    phone: trimmedPhone,
    email: trimmedEmail,
    vehicle: trimmedVehicle,
    issue: issueValue,
    urgency: urgencyValue,
    additional_details: trimmedDetails,
    contact_type: contactType,
    business: business
      ? {
          title: business.title,
          email: business.email,
          is_claimed: business.is_claimed,
          slug: business.slug,
        }
      : null,
  };

  if (businessEmail) {
    const leadResult = await sendFreeLeadToBusiness({
      message: messageForLead,
      businessEmail,
    });

    if (leadResult.ok) {
      const { error: markError } = await markContactMessagesSentAndConfirmed([
        contactMessageId,
      ]);

      if (!markError) {
        autoSent = true;
        await deleteCacheDataByPrefix("CONTACT_MESSAGES");
      } else if (process.env.NODE_ENV === "development") {
        console.error(
          "Lead emailed but failed to mark contact message sent:",
          markError
        );
      }
    } else if (process.env.NODE_ENV === "development") {
      console.error("Failed to auto-send lead email:", leadResult.error);
    }
  }

  // Customer email + Admin Notification
  const { SENDER_EMAIL, RESEND_API_KEY, ADMIN_EMAIL } = process.env;

  if (RESEND_API_KEY && SENDER_EMAIL) {
    const inquiry = {
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      vehicle: trimmedVehicle,
      issue: issueValue,
      urgency: urgencyValue,
      additionalDetails: trimmedDetails,
      contactType,
      autoSent,
    };

    if (autoSent) {
      const { error: sendError } = await resendClient().emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [trimmedEmail],
        subject: MESSAGE_ON_ITS_WAY.subject(businessName),
        html: MESSAGE_ON_ITS_WAY.html(trimmedName, businessName),
      });

      if (sendError && process.env.NODE_ENV === "development") {
        console.error("Failed to send message-on-its-way email:", sendError);
      }
    } else {
      const { error: sendError } = await resendClient().emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [trimmedEmail],
        subject: UNDER_REVIEW_MESSAGE.subject,
        html: UNDER_REVIEW_MESSAGE.html(trimmedName, businessName),
      });

      if (sendError && process.env.NODE_ENV === "development") {
        console.error("Failed to send under-review email:", sendError);
      }
    }

    if (ADMIN_EMAIL) {
      const { error: adminSendError } = await resendClient().emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: ADMIN_NEW_CONTACT_MESSAGE.subject(businessName, { autoSent }),
        html: ADMIN_NEW_CONTACT_MESSAGE.html(businessName, inquiry),
      });

      if (adminSendError && process.env.NODE_ENV === "development") {
        console.error(
          "Failed to send admin notification email:",
          adminSendError
        );
      }
    }
  }

  return res.status(201).json(
    successHandler({
      contactMessageId,
      autoSent,
    })
  );
};
