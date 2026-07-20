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
    claimLink
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

  <p>If you'd like to make sure you never miss inquiries like this (and want more control over your listing: photos, hours, direct contact info, and priority visibility), you can 
    <a href="${escapeHtml(claimLink ?? getWebBaseUrl())}" style="color: #1a73e8;">claim your free business listing here</a>.
  </p>

  <p>Otherwise, feel free to reach out to this person directly using the info above.</p>

  <p>If you have any questions, please feel free to reply to this email or contact us anytime.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

export function getWebBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return (
      process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"
    ).replace(/\/$/, "");
  }
  return (
    process.env.NEXT_PUBLIC_WEB_URL || "https://radiatorrepairhub.com"
  ).replace(/\/$/, "");
}

export function buildBusinessClaimLink(businessSlug) {
  const baseUrl = getWebBaseUrl();
  if (!businessSlug) return baseUrl;
  return `${baseUrl}/business/${businessSlug}`;
}

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

export function buildFreeLeadClaimOfferPreview(message) {
  return {
    subject: FREE_LEAD_CLAIM_OFFER_MESSAGE.subject,
    html: FREE_LEAD_CLAIM_OFFER_MESSAGE.html(
      message?.business?.title,
      {
        name: message?.name,
        phone: message?.phone,
        email: message?.email,
        vehicle: message?.vehicle,
        issue: message?.issue,
        urgency: message?.urgency,
        additionalDetails: message?.additional_details,
      },
      buildBusinessClaimLink(message?.business?.slug)
    ),
  };
}

export function buildMessageOnItsWayPreview(message) {
  const businessName = message?.business?.title;
  return {
    subject: MESSAGE_ON_ITS_WAY.subject(businessName),
    html: MESSAGE_ON_ITS_WAY.html(message?.name, businessName),
  };
}
