import { resendClient } from "../resend/resend.js";
import { getWebBaseUrl } from "./constants/messages.js";
import { EMAIL_SUPPRESSION_TYPES } from "./emailSuppressionTypes.js";
import {
  buildReviewEmailHtml,
  formatReviewFromAddress,
  reviewEmailSubject,
} from "./reviewRequest.js";
import {
  buildOneClickUnsubscribeUrl,
  buildUnsubscribeUrl,
  signUnsubscribeToken,
} from "./unsubscribeToken.js";

export function resolveReviewRecipientEmail(customerEmail) {
  if (process.env.NODE_ENV === "development") {
    return process.env.TEST_RECIPIENT_EMAIL;
  }
  return customerEmail;
}

export function buildReviewEmailPayload({
  businessId,
  shopTitle,
  message,
  reviewUrl,
  customerEmail,
  replyTo,
  senderEmail,
}) {
  const token = signUnsubscribeToken({
    businessId,
    email: customerEmail,
    type: EMAIL_SUPPRESSION_TYPES.REVIEW_REQUEST,
  });
  const unsubscribeUrl = buildUnsubscribeUrl(token, getWebBaseUrl());
  const oneClickUnsubscribeUrl = buildOneClickUnsubscribeUrl(
    token,
    getWebBaseUrl()
  );
  const payload = {
    from: formatReviewFromAddress(shopTitle, senderEmail),
    to: [resolveReviewRecipientEmail(customerEmail)],
    subject: reviewEmailSubject(shopTitle),
    html: buildReviewEmailHtml({
      message,
      reviewUrl,
      shopTitle,
      unsubscribeUrl,
    }),
    headers: {
      "List-Unsubscribe": `<${oneClickUnsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
  if (typeof replyTo === "string" && replyTo.includes("@")) {
    payload.replyTo = replyTo.trim();
  }
  return payload;
}

export async function sendReviewRequestEmail(args) {
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

  const payload = buildReviewEmailPayload({
    ...args,
    senderEmail: SENDER_EMAIL,
  });

  const { data, error } = await resendClient().emails.send(payload);
  if (error) {
    return { ok: false, error };
  }
  return { ok: true, data };
}
