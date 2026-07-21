import {
  formatIssueLabel,
  formatUrgencyLabel,
} from "@/lib/contact-messages";

function escapeHtml(value) {
  if (value == null || value === "") return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function displayValue(value) {
  const text = value == null || value === "" ? "N/A" : String(value);
  return escapeHtml(text);
}

// Keep in sync with server/src/lib/constants/messages.js
export const FREE_LEAD_CLAIM_OFFER_MESSAGE = Object.freeze({
  subject: "New Customer Inquiry from RadiatorRepairHub",
  html: (
    businessName,
    { name, phone, email, vehicle, issue, urgency, additionalDetails },
  ) => `
  <p>Hi ${displayValue(businessName ?? "There")},</p>

  <p>Someone found your business on RadiatorRepairHub and wanted to contact you.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
      <td style="padding: 8px 0;">${displayValue(name)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Email:</td>
      <td style="padding: 8px 0;">${displayValue(email)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
      <td style="padding: 8px 0;">${displayValue(phone)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Vehicle:</td>
      <td style="padding: 8px 0;">${displayValue(vehicle)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Issue:</td>
      <td style="padding: 8px 0;">${escapeHtml(formatIssueLabel(issue))}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Urgency:</td>
      <td style="padding: 8px 0;">${escapeHtml(formatUrgencyLabel(urgency))}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Additional Details:</td>
      <td style="padding: 8px 0;">${displayValue(additionalDetails)}</td>
    </tr>
  </table>

  <p>We're passing this along for free, no strings attached.</p>

  <p>Feel free to reach out to this person directly using the info above.</p>

  <p>If you have any questions, please feel free to reply to this email or contact us anytime.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Keep in sync with server/src/lib/constants/messages.js
export const MESSAGE_ON_ITS_WAY = Object.freeze({
  subject: (businessName) =>
    `Your message is on its way to ${businessName ?? "the business"}`,
  html: (name, businessName) => `
  <p>Hi ${displayValue(name ?? "There")},</p>

  <p>Good news! Your message has been sent to <strong>${displayValue(businessName ?? "the business")}</strong>! They now have your contact info and details about your inquiry, so you should hear back from them soon or we'll contact you with an update.</p>

  <p>If you don't hear back within a day or so, feel free to reach out to them directly.</p>

  <p>If you have any questions, please feel free to reply to this email or contact us anytime.</p>

  <p>Thanks for using RadiatorRepairHub!</p>

  <p>The RadiatorRepairHub Team</p>
  `,
});

export const DECLINED_RECOMMENDATIONS_FALLBACK =
  "We'd be happy to help you find another shop nearby, feel free to browse other listings on RadiatorRepairHub, or let us know if you'd like some help.";

export const MESSAGE_DECLINED = Object.freeze({
  subject: (businessName) =>
    `Update on your message to ${businessName ?? "the business"}`,
  html: (name, businessName, recommendationsHtml) => `
  <p>Hi ${displayValue(name ?? "There")},</p>

  <p>Unfortunately, <strong>${displayValue(businessName ?? "the business")}</strong> isn't able to take on your request at this time.</p>

  <p>Here are a few other nearby shops that might be able to help:</p>

  ${recommendationsHtml ?? `<p>${DECLINED_RECOMMENDATIONS_FALLBACK}</p>`}

  <p>Sorry for the inconvenience, and thanks for using RadiatorRepairHub!</p>

  <p>The RadiatorRepairHub Team</p>
  `,
});

export const MESSAGE_NO_RESPONSE = Object.freeze({
  subject: (businessName) =>
    `Update on your message to ${businessName ?? "the business"}`,
  html: (name, businessName, recommendationsHtml) => `
  <p>Hi ${displayValue(name ?? "There")},</p>

  <p>We haven't heard back from <strong>${displayValue(businessName ?? "the business")}</strong> yet regarding your inquiry. Sometimes businesses take a bit longer to respond, especially during busy periods.</p>

  <p>In the meantime, here are a few other nearby shops that might be able to help:</p>

  ${recommendationsHtml ?? `<p>${DECLINED_RECOMMENDATIONS_FALLBACK}</p>`}

  <p>Feel free to reach out to them, or wait a bit longer to hear back from ${displayValue(businessName ?? "the business")}.</p>

  <p>Thanks for using RadiatorRepairHub!</p>

  <p>The RadiatorRepairHub Team</p>
  `,
});

export function buildFreeLeadClaimOfferPreview(message) {
  return {
    subject: FREE_LEAD_CLAIM_OFFER_MESSAGE.subject,
    html: FREE_LEAD_CLAIM_OFFER_MESSAGE.html(message?.business?.title, {
      name: message?.name,
      phone: message?.phone,
      email: message?.email,
      vehicle: message?.vehicle,
      issue: message?.issue,
      urgency: message?.urgency,
      additionalDetails: message?.additional_details,
    }),
  };
}

export function buildMessageOnItsWayPreview(message) {
  const businessName = message?.business?.title;
  return {
    subject: MESSAGE_ON_ITS_WAY.subject(businessName),
    html: MESSAGE_ON_ITS_WAY.html(message?.name, businessName),
  };
}

export function buildMessageDeclinedPreview(message) {
  const businessName = message?.business?.title;
  return {
    subject: MESSAGE_DECLINED.subject(businessName),
    html: MESSAGE_DECLINED.html(
      message?.name,
      businessName,
      `<p>${DECLINED_RECOMMENDATIONS_FALLBACK}</p>`,
    ),
  };
}

export function buildMessageNoResponsePreview(message) {
  const businessName = message?.business?.title;
  return {
    subject: MESSAGE_NO_RESPONSE.subject(businessName),
    html: MESSAGE_NO_RESPONSE.html(
      message?.name,
      businessName,
      `<p>${DECLINED_RECOMMENDATIONS_FALLBACK}</p>`,
    ),
  };
}
