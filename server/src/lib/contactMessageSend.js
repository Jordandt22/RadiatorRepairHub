import { resendClient } from "../resend/resend.js";
import {
  FREE_LEAD_CLAIM_OFFER_MESSAGE,
  SENDER_NAME,
} from "./constants/messages.js";

export const resolveLeadRecipientEmail = (businessEmail) => {
  if (process.env.NODE_ENV === "development") {
    return process.env.TEST_RECIPIENT_EMAIL;
  }
  return businessEmail;
};

/**
 * Build Resend payload for the free-lead email to a business.
 * @param {{ message: object, businessEmail: string, senderEmail: string }} args
 */
export const buildFreeLeadEmailPayload = ({
  message,
  businessEmail,
  senderEmail,
}) => ({
  from: `${SENDER_NAME} <${senderEmail}>`,
  to: [resolveLeadRecipientEmail(businessEmail)],
  subject: FREE_LEAD_CLAIM_OFFER_MESSAGE.subject,
  html: FREE_LEAD_CLAIM_OFFER_MESSAGE.html(message.business?.title, {
    name: message.name,
    phone: message.phone,
    email: message.email,
    vehicle: message.vehicle,
    issue: message.issue,
    urgency: message.urgency,
    additionalDetails: message.additional_details,
    contactType: message.contact_type,
    isClaimed: message.business?.is_claimed,
    businessSlug: message.business?.slug,
  }),
});

/**
 * Send a single free-lead email to a business. Does not mutate DB.
 * @returns {Promise<{ ok: true, data: unknown } | { ok: false, error: object }>}
 */
export const sendFreeLeadToBusiness = async ({ message, businessEmail }) => {
  const { SENDER_EMAIL, RESEND_API_KEY, TEST_RECIPIENT_EMAIL } = process.env;

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return {
      ok: false,
      error: { message: "Email sending is not configured." },
    };
  }

  if (process.env.NODE_ENV === "development" && !TEST_RECIPIENT_EMAIL) {
    return {
      ok: false,
      error: { message: "TEST_RECIPIENT_EMAIL is required in development." },
    };
  }

  const trimmed =
    typeof businessEmail === "string" ? businessEmail.trim() : "";
  if (!trimmed) {
    return {
      ok: false,
      error: { message: "Business email is missing." },
    };
  }

  const payload = buildFreeLeadEmailPayload({
    message,
    businessEmail: trimmed,
    senderEmail: SENDER_EMAIL,
  });

  const { data, error } = await resendClient().emails.send(payload);
  if (error) {
    return { ok: false, error };
  }

  return { ok: true, data };
};
