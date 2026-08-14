import {
  formatContactTypeLabel,
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

function inquiryEmailRow(
  label,
  value,
  { first = false, width = 120, verticalAlign = false } = {},
) {
  const widthStyle = first ? ` width: ${width}px;` : "";
  const valign = verticalAlign ? " vertical-align: top;" : "";
  return `
    <tr>
      <td style="padding: 8px 0; font-weight: bold;${widthStyle}${valign}">${escapeHtml(label)}:</td>
      <td style="padding: 8px 0;">${value}</td>
    </tr>`;
}

function buildContactInquiryDetailRows({
  name,
  phone,
  email,
  vehicle,
  issue,
  urgency,
  additionalDetails,
  contactType,
}) {
  const isQuestions = contactType === "questions";
  const detailsLabel = isQuestions ? "Message" : "Additional Details";
  const rows = [
    inquiryEmailRow("Name", displayValue(name), { first: true }),
    inquiryEmailRow("Email", displayValue(email)),
    inquiryEmailRow("Phone", displayValue(phone)),
    inquiryEmailRow("Type", escapeHtml(formatContactTypeLabel(contactType))),
  ];

  if (!isQuestions) {
    rows.push(
      inquiryEmailRow("Vehicle", displayValue(vehicle)),
      inquiryEmailRow("Issue", escapeHtml(formatIssueLabel(issue))),
      inquiryEmailRow("Urgency", escapeHtml(formatUrgencyLabel(urgency))),
    );
  }

  rows.push(
    inquiryEmailRow(detailsLabel, displayValue(additionalDetails), {
      verticalAlign: true,
    }),
  );
  return rows.join("");
}

function getWebBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return (process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );
  }
  return "https://radiatorrepairhub.com";
}

function buildBusinessClaimLink(businessSlug) {
  const baseUrl = getWebBaseUrl();
  if (!businessSlug) return baseUrl;
  return `${baseUrl}/business/${escapeHtml(businessSlug)}`;
}

function buildFreeLeadClaimStatusHtml(isClaimed, businessSlug) {
  if (isClaimed) {
    return `<p>Thanks for being a verified business on RadiatorRepairHub, we appreciate you!</p>`;
  }

  const businessPageUrl = buildBusinessClaimLink(businessSlug);
  const howToClaimUrl = `${getWebBaseUrl()}/how-to-claim`;

  return `<p>Want to get more leads like this? Claim your business page here: <a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a>. Not sure how? See our <a href="${howToClaimUrl}" style="color: #1a73e8;">How to Claim</a> guide.</p>`;
}

// Keep in sync with server/src/lib/constants/messages.js
export const FREE_LEAD_CLAIM_OFFER_MESSAGE = Object.freeze({
  subject: "New Customer Inquiry from RadiatorRepairHub",
  html: (
    businessName,
    {
      name,
      phone,
      email,
      vehicle,
      issue,
      urgency,
      additionalDetails,
      contactType,
      isClaimed,
      businessSlug,
    },
  ) => `
  <p>Hi ${displayValue(businessName ?? "There")},</p>

  <p>Someone found your business on RadiatorRepairHub and wanted to contact you.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    ${buildContactInquiryDetailRows({
      name,
      phone,
      email,
      vehicle,
      issue,
      urgency,
      additionalDetails,
      contactType,
    })}
  </table>

  <p>We're passing this along for free, no strings attached.</p>

  <p>Feel free to reach out to this person directly using the info above.</p>

  ${buildFreeLeadClaimStatusHtml(Boolean(isClaimed), businessSlug)}

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
      contactType: message?.contact_type,
      isClaimed: message?.business?.is_claimed,
      businessSlug: message?.business?.slug,
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
