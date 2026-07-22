export const SENDER_NAME = "RadiatorRepairHub Team";

const URGENCY_LABELS = {
  1: "ASAP",
  2: "Can Wait",
};

const ISSUE_LABELS = {
  overheating: "Overheating",
  coolant_leak: "Coolant leak",
  radiator_fan_not_working: "Radiator fan not working",
  strange_noise_or_vibration: "Strange noise or vibration",
  low_discolored_coolant: "Low/discolored coolant",
  radiator_replacement_repair: "Radiator Replacement / Repair",
  routine_maintenance_flush: "Routine Maintenance / Flush",
  other: "Other",
};

export const formatUrgencyLabel = (urgency) => {
  return URGENCY_LABELS[urgency] ?? "N/A";
};

export const formatIssueLabel = (issue) => {
  return ISSUE_LABELS[issue] ?? "N/A";
};

export const getWebBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    return (process.env.WEB_URL || "http://localhost:3000").replace(/\/$/, "");
  }
  return "https://radiatorrepairhub.com";
};

export const buildBusinessClaimLink = (businessSlug) => {
  const baseUrl = getWebBaseUrl();
  if (!businessSlug) return baseUrl;
  return `${baseUrl}/business/${businessSlug}`;
};

// Free lead inquiry forwarded to business
export const FREE_LEAD_CLAIM_OFFER_MESSAGE = Object.freeze({
  subject: "New Customer Inquiry from RadiatorRepairHub",
  html: (
    businessName,
    { name, phone, email, vehicle, issue, urgency, additionalDetails },
  ) => `
  <p>Hi ${businessName ?? "There"},</p>

  <p>Someone found your business on RadiatorRepairHub and wanted to contact you.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
      <td style="padding: 8px 0;">${name ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Email:</td>
      <td style="padding: 8px 0;">${email ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
      <td style="padding: 8px 0;">${phone ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Vehicle:</td>
      <td style="padding: 8px 0;">${vehicle ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Issue:</td>
      <td style="padding: 8px 0;">${formatIssueLabel(issue)}</td>
    </tr>
     <tr>
      <td style="padding: 8px 0; font-weight: bold;">Urgency:</td>
      <td style="padding: 8px 0;">${formatUrgencyLabel(urgency)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Additional Details:</td>
      <td style="padding: 8px 0;">${additionalDetails ?? "N/A"}</td>
    </tr>
  </table>

  <p>We're passing this along for free, no strings attached.</p>

  <p>Feel free to reach out to this person directly using the info above.</p>

  <p>If you have any questions, please feel free to reply to this email or contact us anytime.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Under Review Email
export const UNDER_REVIEW_MESSAGE = Object.freeze({
  subject: "Your Message is Under Review",
  html: (name, businessName) => `
  <p>Hi ${name ?? "There"},</p>

  <p>Thanks for reaching out through RadiatorRepairHub! We're currently reviewing your message, which usually takes about 10-20 minutes.</p>

  <p>Once approved, we'll forward your message to <strong>${businessName ?? "the business"}</strong> — you may hear back from them directly, or we'll follow up to confirm it's been sent.</p>

  <p>If you need a faster response, we'd recommend contacting the business directly in the meantime.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Admin notification when a new contact message is submitted
export const ADMIN_NEW_CONTACT_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `New contact message${businessName ? ` for ${businessName}` : ""}`,
  html: (
    businessName,
    { name, phone, email, vehicle, issue, urgency, additionalDetails },
  ) => `
  <p>A new contact message was submitted on RadiatorRepairHub.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 140px;">Business:</td>
      <td style="padding: 8px 0;">${businessName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Name:</td>
      <td style="padding: 8px 0;">${name ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Email:</td>
      <td style="padding: 8px 0;">${email ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
      <td style="padding: 8px 0;">${phone ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Vehicle:</td>
      <td style="padding: 8px 0;">${vehicle ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Issue:</td>
      <td style="padding: 8px 0;">${formatIssueLabel(issue)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Urgency:</td>
      <td style="padding: 8px 0;">${formatUrgencyLabel(urgency)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Additional Details:</td>
      <td style="padding: 8px 0;">${additionalDetails ?? "N/A"}</td>
    </tr>
  </table>

  <p>Review it in the admin dashboard under Pending.</p>
  `,
});

// Confirmation: message forwarded to business
export const MESSAGE_ON_ITS_WAY = Object.freeze({
  subject: (businessName) =>
    `Your message is on its way to ${businessName ?? "the business"}`,
  html: (name, businessName) => `
  <p>Hi ${name ?? "There"},</p>

  <p>Good news! Your message has been sent to <strong>${businessName ?? "the business"}</strong>! They now have your contact info and details about your inquiry, so you should hear back from them soon or we'll contact you with an update.</p>

  <p>If you don't hear back within a day or so, feel free to reach out to them directly.</p>

  <p>If you have any questions, please feel free to reply to this email or contact us anytime.</p>

  <p>Thanks for using RadiatorRepairHub!</p>

  <p>The RadiatorRepairHub Team</p>
  `,
});

export const DECLINED_RECOMMENDATIONS_FALLBACK =
  "We'd be happy to help you find another shop nearby, feel free to browse other listings on RadiatorRepairHub, or let us know if you'd like some help.";

export const buildNearbyRecommendationsHtml = (
  shops,
  fallback = DECLINED_RECOMMENDATIONS_FALLBACK
) => {
  if (!Array.isArray(shops) || shops.length === 0) {
    return `<p>${fallback}</p>`;
  }

  const items = shops
    .map((shop) => {
      const title = shop?.title ?? "Shop";
      const rating =
        shop?.total_score == null ? "N/A" : String(shop.total_score);
      const address = shop?.address ?? "Address unavailable";
      const pageUrl = buildBusinessClaimLink(shop?.slug);
      return `<li style="margin-bottom: 12px;"><strong>${title}</strong> — Rating: ${rating}<br>${address}<br><a href="${pageUrl}" style="color: #1a73e8;">View on RadiatorRepairHub</a></li>`;
    })
    .join("");

  return `<ul style="padding-left: 20px; margin: 16px 0;">${items}</ul>`;
};

export const buildDeclinedRecommendationsHtml = (shops) =>
  buildNearbyRecommendationsHtml(shops, DECLINED_RECOMMENDATIONS_FALLBACK);

// Declined: business cannot take the request
export const MESSAGE_DECLINED = Object.freeze({
  subject: (businessName) =>
    `Update on your message to ${businessName ?? "the business"}`,
  html: (name, businessName, recommendationsHtml) => `
  <p>Hi ${name ?? "There"},</p>

  <p>Unfortunately, <strong>${businessName ?? "the business"}</strong> isn't able to take on your request at this time.</p>

  <p>Here are a few other nearby shops that might be able to help:</p>

  ${recommendationsHtml ?? `<p>${DECLINED_RECOMMENDATIONS_FALLBACK}</p>`}

  <p>Sorry for the inconvenience, and thanks for using RadiatorRepairHub!</p>

  <p>The RadiatorRepairHub Team</p>
  `,
});

// No response: business has not replied
export const MESSAGE_NO_RESPONSE = Object.freeze({
  subject: (businessName) =>
    `Update on your message to ${businessName ?? "the business"}`,
  html: (name, businessName, recommendationsHtml) => `
  <p>Hi ${name ?? "There"},</p>

  <p>We haven't heard back from <strong>${businessName ?? "the business"}</strong> yet regarding your inquiry. Sometimes businesses take a bit longer to respond, especially during busy periods.</p>

  <p>In the meantime, here are a few other nearby shops that might be able to help:</p>

  ${recommendationsHtml ?? `<p>${DECLINED_RECOMMENDATIONS_FALLBACK}</p>`}

  <p>Feel free to reach out to them, or wait a bit longer to hear back from ${businessName ?? "the business"}.</p>

  <p>Thanks for using RadiatorRepairHub!</p>

  <p>The RadiatorRepairHub Team</p>
  `,
});
