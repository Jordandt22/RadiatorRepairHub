import {
  CLAIM_INVITE_OUTREACH_MESSAGE,
  OWNERSHIP_CLAIM_INVITE_OUTREACH_MESSAGE,
  LEAD_CLAIM_INVITE_OUTREACH_MESSAGE,
  WEBSITE_OFFER_OUTREACH_MESSAGE,
  SENDER_NAME,
  buildBusinessClaimLink,
  getWebBaseUrl,
} from "./constants/messages.js";

export const OUTREACH_TYPES = Object.freeze({
  CLAIM_INVITE: "claim_invite",
  OWNERSHIP_CLAIM_INVITE: "ownership_claim_invite",
  LEAD_CLAIM_INVITE: "lead_claim_invite",
  WEBSITE_OFFER: "website_offer",
});

/** Claim-invite A/B variants share eligibility (one claim email per business). */
export const CLAIM_INVITE_OUTREACH_TYPES = Object.freeze([
  OUTREACH_TYPES.CLAIM_INVITE,
  OUTREACH_TYPES.OWNERSHIP_CLAIM_INVITE,
  OUTREACH_TYPES.LEAD_CLAIM_INVITE,
]);

export const isClaimInviteOutreachType = (outreachType) =>
  CLAIM_INVITE_OUTREACH_TYPES.includes(outreachType);

export const CLAIM_ELIGIBILITY = Object.freeze({
  ABLE: "able",
  NO_EMAIL: "no_email",
  DUPLICATE_EMAIL: "duplicate_email",
  CLAIMED: "claimed",
});

export const isOutreachDevRedirect = () =>
  process.env.NODE_ENV === "development";

export const resolveOutreachRecipientEmail = (email) => {
  if (isOutreachDevRedirect()) {
    return process.env.TEST_RECIPIENT_EMAIL;
  }
  return email;
};

export const resolveOutreachRecipient = (business) => {
  const listingEmail =
    typeof business?.email === "string" ? business.email.trim() : "";
  const ownerEmail =
    typeof business?.owner_email === "string"
      ? business.owner_email.trim()
      : "";

  if (business?.is_claimed || business?.claim_eligibility === "claimed") {
    return ownerEmail || listingEmail || null;
  }

  return listingEmail || null;
};

export const hasWebsite = (business) => {
  const website =
    typeof business?.website === "string" ? business.website.trim() : "";
  return Boolean(website);
};

export const evaluateOutreachEligibility = (business, outreachType) => {
  const eligibility = business?.claim_eligibility;

  if (isClaimInviteOutreachType(outreachType)) {
    if (eligibility !== CLAIM_ELIGIBILITY.ABLE) {
      return { ok: false, reason: `eligibility_${eligibility || "unknown"}` };
    }
    if (business?.claim_invite_sent_at) {
      return { ok: false, reason: "already_sent" };
    }
    const recipient = resolveOutreachRecipient(business);
    if (!recipient) {
      return { ok: false, reason: "missing_recipient" };
    }
    return { ok: true, recipient };
  }

  if (outreachType === OUTREACH_TYPES.WEBSITE_OFFER) {
    if (
      eligibility !== CLAIM_ELIGIBILITY.ABLE &&
      eligibility !== CLAIM_ELIGIBILITY.CLAIMED
    ) {
      return { ok: false, reason: `eligibility_${eligibility || "unknown"}` };
    }
    if (hasWebsite(business)) {
      return { ok: false, reason: "has_website" };
    }
    if (business?.website_offer_sent_at) {
      return { ok: false, reason: "already_sent" };
    }
    const recipient = resolveOutreachRecipient(business);
    if (!recipient) {
      return { ok: false, reason: "missing_recipient" };
    }
    return { ok: true, recipient };
  }

  return { ok: false, reason: "invalid_outreach_type" };
};

export const buildOutreachEmailContent = (business, outreachType) => {
  const businessName = business?.title ?? null;
  const businessPageUrl = buildBusinessClaimLink(business?.slug);
  const howToClaimUrl = `${getWebBaseUrl()}/how-to-claim`;

  if (outreachType === OUTREACH_TYPES.CLAIM_INVITE) {
    return {
      subject: CLAIM_INVITE_OUTREACH_MESSAGE.subject(businessName),
      html: CLAIM_INVITE_OUTREACH_MESSAGE.html(businessName, {
        businessPageUrl,
        howToClaimUrl,
      }),
    };
  }

  if (outreachType === OUTREACH_TYPES.OWNERSHIP_CLAIM_INVITE) {
    return {
      subject: OWNERSHIP_CLAIM_INVITE_OUTREACH_MESSAGE.subject(businessName),
      html: OWNERSHIP_CLAIM_INVITE_OUTREACH_MESSAGE.html(businessName, {
        businessPageUrl,
        howToClaimUrl,
      }),
    };
  }

  if (outreachType === OUTREACH_TYPES.LEAD_CLAIM_INVITE) {
    return {
      subject: LEAD_CLAIM_INVITE_OUTREACH_MESSAGE.subject(businessName),
      html: LEAD_CLAIM_INVITE_OUTREACH_MESSAGE.html(businessName, {
        businessPageUrl,
        howToClaimUrl,
      }),
    };
  }

  if (outreachType === OUTREACH_TYPES.WEBSITE_OFFER) {
    return {
      subject: WEBSITE_OFFER_OUTREACH_MESSAGE.subject(businessName),
      html: WEBSITE_OFFER_OUTREACH_MESSAGE.html(businessName, {
        businessPageUrl,
      }),
    };
  }

  return null;
};

export const buildOutreachEmailPayload = ({
  business,
  outreachType,
  recipient,
  senderEmail,
}) => {
  const content = buildOutreachEmailContent(business, outreachType);
  if (!content) return null;

  const deliveryTo = resolveOutreachRecipientEmail(recipient);
  const subject = isOutreachDevRedirect()
    ? `[DEV] ${content.subject}`
    : content.subject;

  return {
    from: `${SENDER_NAME} <${senderEmail}>`,
    to: [deliveryTo],
    subject,
    html: content.html,
  };
};
