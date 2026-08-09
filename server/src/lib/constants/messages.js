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

export const buildClaimVerifyLink = (claimRequestId) => {
  const baseUrl = getWebBaseUrl();
  return `${baseUrl}/claim/verify/${claimRequestId}`;
};

export const maskEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) return "***";

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const firstChar = local[0] ?? "";
  return `${firstChar}***@${domain}`;
};

// Business ownership claim verification
export const CLAIM_VERIFICATION_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Verify your claim for ${businessName ?? "your business"}`,
  html: (businessName, code, verifyUrl, businessPageUrl) => `
  <p>Hi there,</p>

  <p>Someone requested to claim <strong>${businessName ?? "your business"}</strong> on RadiatorRepairHub.</p>

  <p>Your verification code is:</p>
  <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">${code}</p>

  <p>Click the link below to complete your claim (this code expires in 1 hour):</p>
  <p><a href="${verifyUrl}" style="color: #1a73e8;">${verifyUrl}</a></p>

  <p>If you did not request this, you can ignore this email and no action is required.</p>

  <p>View the listing here:<br>
  <a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

const buildFreeLeadClaimStatusHtml = (isClaimed, businessSlug) => {
  if (isClaimed) {
    return `<p>Thanks for being a verified business on RadiatorRepairHub, we appreciate you!</p>`;
  }

  const businessPageUrl = buildBusinessClaimLink(businessSlug);
  const howToClaimUrl = `${getWebBaseUrl()}/how-to-claim`;

  return `<p>Want to get more leads like this? Claim your business page here: <a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a>. Not sure how? See our <a href="${howToClaimUrl}" style="color: #1a73e8;">How to Claim</a> guide.</p>`;
};

// Free lead inquiry forwarded to business
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
      isClaimed,
      businessSlug,
    },
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

  ${buildFreeLeadClaimStatusHtml(Boolean(isClaimed), businessSlug)}

  <p>If you have any questions, please feel free to reply to this email or contact us anytime.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Under Review Email
export const UNDER_REVIEW_MESSAGE = Object.freeze({
  subject: "Your Message is Under Review",
  html: (name, businessName) => `
  <p>Hi ${name ?? "There"},</p>

  <p>Thanks for reaching out through RadiatorRepairHub! We're currently reviewing your message, which usually takes about 2-3 hours.</p>

  <p>Once approved, we'll forward your message to <strong>${businessName ?? "the business"}</strong> — you may hear back from them directly, or we'll follow up to confirm it's been sent.</p>

  <p>If that isn't fast enough, please contact the business directly using their phone number or email on their listing.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Admin notification when a new contact message is submitted
export const ADMIN_NEW_CONTACT_MESSAGE = Object.freeze({
  subject: (businessName, { autoSent = false } = {}) =>
    `${autoSent ? "[Auto-sent] " : "[Needs review] "}New contact message${
      businessName ? ` for ${businessName}` : ""
    }`,
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
      autoSent = false,
    },
  ) => `
  <p>A new contact message was submitted on RadiatorRepairHub${
    autoSent
      ? " and was <strong>auto-sent</strong> to the business."
      : " and <strong>needs review</strong> before sending."
  }</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 140px;">Business:</td>
      <td style="padding: 8px 0;">${businessName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Status:</td>
      <td style="padding: 8px 0;">${
        autoSent ? "Auto-sent" : "Needs review (Pending)"
      }</td>
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

  <p>${
    autoSent
      ? "View it in the admin dashboard under Sent → Auto Sent."
      : "Review it in the admin dashboard under Pending."
  }</p>
  `,
});

const LISTING_REPORT_REASON_LABELS = {
  wrong_claim_contact: "Wrong claim contact info",
  incorrect_outdated: "Incorrect or outdated info",
  inappropriate: "Inappropriate or misleading content",
};

export const formatListingReportReasonLabel = (reason) => {
  return LISTING_REPORT_REASON_LABELS[reason] ?? reason ?? "N/A";
};

const escapeEmailHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Confirmation email sent to the reporter after a listing report is submitted
export const LISTING_REPORT_RECEIVED_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `We received your report for ${businessName ?? "a listing"}`,
  html: (
    reporterName,
    businessName,
    { reason, details, businessPageUrl } = {},
  ) => {
    const safeName = escapeEmailHtml(reporterName?.trim() || "there");
    const safeBusiness = escapeEmailHtml(businessName ?? "the listing");
    const reasonLabel = escapeEmailHtml(formatListingReportReasonLabel(reason));
    const safeDetails = escapeEmailHtml(details ?? "").replace(/\n/g, "<br>");
    const listingLink = businessPageUrl
      ? `<p>View the listing:<br>
  <a href="${escapeEmailHtml(businessPageUrl)}" style="color: #1a73e8;">${escapeEmailHtml(businessPageUrl)}</a></p>`
      : "";

    return `
  <p>Hi ${safeName},</p>

  <p>Thanks for reporting info through RadiatorRepairHub. We received your report for <strong>${safeBusiness}</strong> and will review it soon.</p>

  <p><strong>What You Submitted:</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin: 12px 0 20px;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 100px; vertical-align: top;">Reason:</td>
      <td style="padding: 8px 0;">${reasonLabel}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Details:</td>
      <td style="padding: 8px 0;">${safeDetails || "N/A"}</td>
    </tr>
  </table>

  <p>If the listing needs an update, we'll make the change when appropriate.</p>

  ${listingLink}

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `;
  },
});

// Admin notification when a listing report is submitted
export const ADMIN_NEW_LISTING_REPORT_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `New listing report${businessName ? ` for ${businessName}` : ""}`,
  html: (
    businessName,
    {
      reason,
      details,
      reporterName,
      reporterEmail,
      suggestedPhone,
      suggestedEmail,
      businessPageUrl,
      adminQueueUrl,
      listingPhone,
      listingEmail,
    },
  ) => `
  <p>A new listing report was submitted on RadiatorRepairHub.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 160px;">Business:</td>
      <td style="padding: 8px 0;">${businessName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Reason:</td>
      <td style="padding: 8px 0;">${formatListingReportReasonLabel(reason)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Reporter name:</td>
      <td style="padding: 8px 0;">${reporterName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Reporter email:</td>
      <td style="padding: 8px 0;">${reporterEmail ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Listed phone:</td>
      <td style="padding: 8px 0;">${listingPhone ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Listed email:</td>
      <td style="padding: 8px 0;">${listingEmail ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Suggested phone:</td>
      <td style="padding: 8px 0;">${suggestedPhone ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Suggested email:</td>
      <td style="padding: 8px 0;">${suggestedEmail ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Details:</td>
      <td style="padding: 8px 0;">${details ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Listing:</td>
      <td style="padding: 8px 0;">${
        businessPageUrl
          ? `<a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a>`
          : "N/A"
      }</td>
    </tr>
  </table>

  <p>${
    adminQueueUrl
      ? `Review it in the <a href="${adminQueueUrl}" style="color: #1a73e8;">admin listing reports queue</a>.`
      : "Review it in the admin listing reports queue."
  }</p>
  `,
});

// Confirmation email sent after a general contact inquiry is submitted
export const CONTACT_INQUIRY_RECEIVED_MESSAGE = Object.freeze({
  subject: "We received your message",
  html: (name, { subject, message } = {}) => {
    const safeName = escapeEmailHtml(name?.trim() || "there");
    const safeSubject = escapeEmailHtml(subject ?? "N/A");
    const safeMessage = escapeEmailHtml(message ?? "").replace(/\n/g, "<br>");

    return `
  <p>Hi ${safeName},</p>

  <p>Thanks for contacting RadiatorRepairHub. We received your message and will get back to you within 24 hours.</p>

  <p><strong>What You Submitted:</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin: 12px 0 20px;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 100px; vertical-align: top;">Subject:</td>
      <td style="padding: 8px 0;">${safeSubject}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
      <td style="padding: 8px 0;">${safeMessage || "N/A"}</td>
    </tr>
  </table>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `;
  },
});

// Admin notification when a general contact inquiry is submitted
export const ADMIN_NEW_CONTACT_INQUIRY_MESSAGE = Object.freeze({
  subject: (subject) => `New contact inquiry${subject ? `: ${subject}` : ""}`,
  html: (
    {
      name,
      email,
      phone,
      subject,
      message,
      adminQueueUrl,
    } = {},
  ) => `
  <p>A new contact inquiry was submitted on RadiatorRepairHub.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td>
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
      <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
      <td style="padding: 8px 0;">${subject ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
      <td style="padding: 8px 0;">${message ?? "N/A"}</td>
    </tr>
  </table>

  <p>${
    adminQueueUrl
      ? `Review it in the <a href="${adminQueueUrl}" style="color: #1a73e8;">admin inquiries queue</a>.`
      : "Review it in the admin inquiries queue."
  }</p>
  `,
});

// Confirmation email sent after a get-listed request is submitted
export const LISTING_REQUEST_RECEIVED_MESSAGE = Object.freeze({
  subject: "We received your listing request",
  html: (businessName, { message } = {}) => {
    const safeName = escapeEmailHtml(businessName?.trim() || "there");
    const safeMessage = escapeEmailHtml(message ?? "").replace(/\n/g, "<br>");

    return `
  <p>Hi ${safeName},</p>

  <p>Thanks for submitting your business to RadiatorRepairHub. We received your listing request and will review it within 2-3 business days.</p>

  <p><strong>What You Submitted:</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin: 12px 0 20px;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 120px; vertical-align: top;">Business:</td>
      <td style="padding: 8px 0;">${safeName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Details:</td>
      <td style="padding: 8px 0;">${safeMessage || "N/A"}</td>
    </tr>
  </table>

  <p>Once your listing is approved and live, we'll send another email with a link to your page.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `;
  },
});

// Admin notification when a get-listed request is submitted
export const ADMIN_NEW_LISTING_REQUEST_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `New listing request${businessName ? `: ${businessName}` : ""}`,
  html: (
    {
      businessName,
      email,
      phone,
      message,
      adminQueueUrl,
    } = {},
  ) => `
  <p>A new Get Listed request was submitted on RadiatorRepairHub.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 140px;">Business:</td>
      <td style="padding: 8px 0;">${businessName ?? "N/A"}</td>
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
      <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
      <td style="padding: 8px 0;">${message ?? "N/A"}</td>
    </tr>
  </table>

  <p>${
    adminQueueUrl
      ? `Review it in the <a href="${adminQueueUrl}" style="color: #1a73e8;">admin get listed queue</a>.`
      : "Review it in the admin get listed queue."
  }</p>
  `,
});

// Email sent when a listing request is marked listed
export const LISTING_REQUEST_LIVE_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Your listing is live${businessName ? `: ${businessName}` : ""}`,
  html: (businessName, { businessPageUrl } = {}) => {
    const safeName = escapeEmailHtml(businessName?.trim() || "your business");
    const listingLink = businessPageUrl
      ? `<p>View your listing:<br>
  <a href="${escapeEmailHtml(businessPageUrl)}" style="color: #1a73e8;">${escapeEmailHtml(businessPageUrl)}</a></p>`
      : `<p>Your listing is now live on RadiatorRepairHub. Search for your business name on the site to find your page.</p>`;

    return `
  <p>Hi there,</p>

  <p>Good news! <strong>${safeName}</strong> is now listed on RadiatorRepairHub.</p>

  ${listingLink}

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `;
  },
});

// Admin notification when a business is successfully claimed
export const ADMIN_BUSINESS_CLAIMED_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Business claimed${businessName ? `: ${businessName}` : ""}`,
  html: (businessName, { email, businessPageUrl }) => `
  <p>A business was successfully claimed on RadiatorRepairHub.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 140px;">Business:</td>
      <td style="padding: 8px 0;">${businessName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Owner email:</td>
      <td style="padding: 8px 0;">${email ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Listing:</td>
      <td style="padding: 8px 0;"><a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></td>
    </tr>
  </table>
  `,
});

// Thank-you email sent to the business owner after a successful claim
export const OWNER_CLAIM_THANK_YOU_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Thanks for claiming ${businessName ?? "your business"} on RadiatorRepairHub`,
  html: (businessName, { businessPageUrl, dashboardUrl }) => `
  <p>Hi there,</p>

  <p>Thank you for claiming <strong>${businessName ?? "your business"}</strong> on RadiatorRepairHub. Your account is ready, and you can now manage your listing.</p>

  <p>View your listing:<br>
  <a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Go to your dashboard:<br>
  <a href="${dashboardUrl}" style="color: #1a73e8;">${dashboardUrl}</a></p>

  <p><strong>With your Claimed Listing, you can:</strong></p>
  <ul>
    <li>Update information about your business</li>
    <li>Keep contact info accurate so customers can reach you</li>
    <li>Show as a verified shop and have higher priority in search results</li>
  </ul>

  <p>If you have any questions, just reply to this email, we're happy to help anytime!</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

const OUTREACH_TYPE_ADMIN_LABELS = {
  claim_invite: "Claim invite",
  ownership_claim_invite: "Claim invite (ownership)",
  lead_claim_invite: "Claim invite (leads)",
  custom_claim_invite: "Claim invite (custom)",
  claim_followup: "Claim follow-up",
  website_offer: "Website offer",
};

// Admin notification after a bulk outreach send
export const ADMIN_OUTREACH_SENT_MESSAGE = Object.freeze({
  subject: (outreachType, sentCount) => {
    const label =
      OUTREACH_TYPE_ADMIN_LABELS[outreachType] ?? outreachType ?? "Outreach";
    return `Outreach sent: ${sentCount} ${label} email${
      sentCount === 1 ? "" : "s"
    }`;
  },
  html: ({
    outreachType,
    sentCount,
    skippedCount,
    historyUrl,
    devRedirect,
  }) => {
    const label =
      OUTREACH_TYPE_ADMIN_LABELS[outreachType] ?? outreachType ?? "Outreach";
    return `
  <p>A bulk outreach send completed on RadiatorRepairHub.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 160px;">Email type:</td>
      <td style="padding: 8px 0;">${label}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Sent:</td>
      <td style="padding: 8px 0;">${sentCount ?? 0}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold;">Skipped:</td>
      <td style="padding: 8px 0;">${skippedCount ?? 0}</td>
    </tr>
    ${
      devRedirect
        ? `<tr>
      <td style="padding: 8px 0; font-weight: bold;">Mode:</td>
      <td style="padding: 8px 0;">Development redirect (test recipient)</td>
    </tr>`
        : ""
    }
  </table>

  <p>${
    historyUrl
      ? `Review sends in the <a href="${historyUrl}" style="color: #1a73e8;">outreach history</a>.`
      : "Review sends in the admin outreach history."
  }</p>
  `;
  },
});

// Outreach: invite unclaimed businesses to claim their listing (A — control)
export const CLAIM_INVITE_OUTREACH_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Claim your free listing on RadiatorRepairHub${
      businessName ? `: ${businessName}` : ""
    }`,
  html: (businessName, { businessPageUrl, howToClaimUrl }) => `
  <p>Hi there,</p>

  <p>We listed <strong>${businessName ?? "your business"}</strong> on RadiatorRepairHub so local customers can find radiator repair shops near them.</p>

  <p>Claim your free listing to update your info, respond to leads, and show customers you're verified:</p>
  <p><a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Not sure how? See our <a href="${howToClaimUrl}" style="color: #1a73e8;">How to Claim</a> guide.</p>

  <p>Your RadiatorRepairHub page can also work as a simple website link for Google Business Profile, ads, and social profiles.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Outreach A/B: ownership / control framing
export const OWNERSHIP_CLAIM_INVITE_OUTREACH_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `${businessName ?? "Your business"} is listed on RadiatorRepairHub - Claim it for Free!`,
  html: (businessName, { businessPageUrl, howToClaimUrl }) => `
  <p>Hi there,</p>

  <p><strong>${businessName ?? "Your business"}</strong> already has a listing on RadiatorRepairHub, the directory customers use to find radiator repair shops near them.</p>

  <p>Right now it isn't claimed, so customers may see outdated info and the page won't be verified, which might turn customers away.</p>

  <p>Claim it for free (takes a few minutes):</p>
  <p><a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Need a walkthrough? See our <a href="${howToClaimUrl}" style="color: #1a73e8;">How to Claim</a> guide.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Outreach A/B: lead / outcome framing
export const LEAD_CLAIM_INVITE_OUTREACH_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Get leads for ${businessName ?? "your business"} on RadiatorRepairHub`,
  html: (businessName, { businessPageUrl, howToClaimUrl }) => `
  <p>Hi there,</p>

  <p>We've been getting an increase in traffic to our site, RadiatorRepairHub, which customers use to find radiator repair shops near them.</p>

  <p>We already have a page for <strong>${businessName ?? "your business"}</strong> on our site and we wanted to make sure that customers are getting the most up to date information.</p>

  <p>Claim your free listing so you can:</p>
  <ul>
    <li>Keep your contact info, hours, and services accurate</li>
    <li>Show as a verified shop and have higher priority in search results</li>
    <li>Increase your visibility and reach more customers</li>
  </ul>

  <p>Claim here: <a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Step-by-step: <a href="${howToClaimUrl}" style="color: #1a73e8;">How to Claim</a> guide.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Outreach: claim-focused invite for manual/custom claim outreach
export const CUSTOM_CLAIM_INVITE_OUTREACH_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Claim your listing on RadiatorRepairHub${
      businessName ? `: ${businessName}` : ""
    }`,
  html: (businessName, { businessPageUrl, howToClaimUrl }) => `
  <p>Hi there,</p>

  <p><strong>${businessName ?? "Your business"}</strong> has a free listing on RadiatorRepairHub, where customers look for radiator repair shops near them.</p>

  <p>Claiming your listing only takes a few minutes and lets you:</p>
  <ul>
    <li>Update your business information</li>
    <li>Keep contact details accurate so customers can reach you</li>
    <li>Show as a verified shop with higher priority in search results</li>
  </ul>

  <p>Claim here: <a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Need help? See our <a href="${howToClaimUrl}" style="color: #1a73e8;">How to Claim</a> guide.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Outreach: final follow-up after any claim-invite variant
export const CLAIM_FOLLOWUP_OUTREACH_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `Follow-up: Claim your listing on RadiatorRepairHub${
      businessName ? `: ${businessName}` : ""
    }`,
  html: (businessName, { businessPageUrl, howToClaimUrl }) => `
  <p>Hi there,</p>

  <p>We previously reached out about claiming your free listing for <strong>${businessName ?? "your business"}</strong> on RadiatorRepairHub.</p>

  <p><strong>By claiming your listing, you can:</strong></p>
  <ul>
    <li>Update information about your business</li>
    <li>Keep contact info accurate so customers can reach you</li>
    <li>Show as a verified shop with higher priority in search results</li>
    <li>Use your RadiatorRepairHub page as a website link for Google Business Profile, ads, and social profiles</li>
  </ul>

  <p>Claim here: <a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Step-by-step: <a href="${howToClaimUrl}" style="color: #1a73e8;">How to Claim</a> guide.</p>

  <p>If you're not interested, no worries! We won't bother you again.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
  `,
});

// Outreach: offer website help / RRH page as web presence
export const WEBSITE_OFFER_OUTREACH_MESSAGE = Object.freeze({
  subject: (businessName) =>
    `A ready-to-use web page for ${businessName ?? "your business"}`,
  html: (businessName, { businessPageUrl }) => `
  <p>Hi there,</p>

  <p>Many shops we work with don't have a dedicated website yet and that can make it harder to run ads, set up Google Business Profile, or share a professional link with customers.</p>

  <p>Good news: <strong>${businessName ?? "your business"}</strong> already has a page on RadiatorRepairHub you can use as your website right now:</p>
  <p><a href="${businessPageUrl}" style="color: #1a73e8;">${businessPageUrl}</a></p>

  <p>Add that link to your Google Business Profile, ads, social profiles, and business cards so customers can find your hours, contact info, and services in one place.</p>

  <p>If you'd rather have your own custom website, reply to this email and we can talk about options.</p>

  <p>Thanks,<br>RadiatorRepairHub Team</p>
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
  fallback = DECLINED_RECOMMENDATIONS_FALLBACK,
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
