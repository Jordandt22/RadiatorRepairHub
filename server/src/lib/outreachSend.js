import {
  CLAIM_INVITE_OUTREACH_MESSAGE,
  OWNERSHIP_CLAIM_INVITE_OUTREACH_MESSAGE,
  LEAD_CLAIM_INVITE_OUTREACH_MESSAGE,
  CUSTOM_CLAIM_INVITE_OUTREACH_MESSAGE,
  CLAIM_FOLLOWUP_OUTREACH_MESSAGE,
  WEBSITE_OFFER_OUTREACH_MESSAGE,
  SENDER_NAME,
  buildBusinessClaimLink,
  getWebBaseUrl,
} from "./constants/messages.js";
import { EMAIL_SUPPRESSION_TYPES } from "./emailSuppressionTypes.js";
import { normalizeNotificationEmail } from "./notificationRecipient.js";
import {
  buildOneClickUnsubscribeUrl,
  buildUnsubscribeUrl,
  signUnsubscribeToken,
} from "./unsubscribeToken.js";

export const OUTREACH_TYPES = Object.freeze({
  CLAIM_INVITE: "claim_invite",
  OWNERSHIP_CLAIM_INVITE: "ownership_claim_invite",
  LEAD_CLAIM_INVITE: "lead_claim_invite",
  CUSTOM_CLAIM_INVITE: "custom_claim_invite",
  CLAIM_FOLLOWUP: "claim_followup",
  WEBSITE_OFFER: "website_offer",
});

/** Minimum days after claim invite before follow-up is eligible. */
export const CLAIM_FOLLOWUP_MIN_DAYS_SINCE_INVITE = 7;

/** Claim-invite A/B variants share eligibility (one claim email per business). */
export const CLAIM_INVITE_OUTREACH_TYPES = Object.freeze([
  OUTREACH_TYPES.CLAIM_INVITE,
  OUTREACH_TYPES.OWNERSHIP_CLAIM_INVITE,
  OUTREACH_TYPES.LEAD_CLAIM_INVITE,
  OUTREACH_TYPES.CUSTOM_CLAIM_INVITE,
]);

export const isClaimInviteOutreachType = (outreachType) =>
  CLAIM_INVITE_OUTREACH_TYPES.includes(outreachType);

export function isClaimInviteOldEnoughForFollowup(
  claimInviteSentAt,
  now = new Date()
) {
  if (!claimInviteSentAt) return false;
  const sentAt = new Date(claimInviteSentAt);
  if (Number.isNaN(sentAt.getTime())) return false;
  const minMs = CLAIM_FOLLOWUP_MIN_DAYS_SINCE_INVITE * 24 * 60 * 60 * 1000;
  return now.getTime() - sentAt.getTime() >= minMs;
}

export const CLAIM_ELIGIBILITY = Object.freeze({
  ABLE: "able",
  NO_EMAIL: "no_email",
  EMAIL_REVIEW: "email_review",
  DUPLICATE_EMAIL: "duplicate_email",
  CLAIMED: "claimed",
});

export const isOutreachDevRedirect = () =>
  process.env.NODE_ENV === "development";

const DEVELOPMENT_OUTREACH_SEND_LIMIT = 2;

export function getEffectiveOutreachSendLimit(requestedLimit) {
  const normalized = Math.max(0, Number(requestedLimit) || 0);
  return isOutreachDevRedirect()
    ? Math.min(normalized, DEVELOPMENT_OUTREACH_SEND_LIMIT)
    : normalized;
}

export function applyOutreachDevelopmentCap({ skipped, eligible }) {
  const limit = getEffectiveOutreachSendLimit(eligible.length);
  if (limit >= eligible.length) return { skipped, eligible };
  return {
    eligible: eligible.slice(0, limit),
    skipped: [
      ...skipped,
      ...eligible.slice(limit).map(({ business }) => ({
        id: business.id,
        title: business.title ?? null,
        reason: "development_send_limit",
      })),
    ],
  };
}

export const resolveOutreachRecipientEmail = (email) => {
  if (isOutreachDevRedirect()) {
    return process.env.TEST_RECIPIENT_EMAIL;
  }
  return email;
};

export const resolveOutreachRecipient = (business) => {
  const listingEmail = normalizeNotificationEmail(business?.email);
  const ownerEmail = normalizeNotificationEmail(business?.owner_email);
  const isClaimed = Boolean(
    business?.is_claimed || business?.claim_eligibility === "claimed"
  );
  if (isClaimed) {
    return ownerEmail || listingEmail || null;
  }
  return listingEmail || null;
};

export const hasWebsite = (business) => {
  const website =
    typeof business?.website === "string" ? business.website.trim() : "";
  return Boolean(website);
};

export const evaluateOutreachEligibility = (
  business,
  outreachType,
  { isSuppressed = false } = {}
) => {
  const eligibility = business?.claim_eligibility;

  if (isSuppressed) {
    return { ok: false, reason: "suppressed" };
  }

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

  if (outreachType === OUTREACH_TYPES.CLAIM_FOLLOWUP) {
    if (eligibility !== CLAIM_ELIGIBILITY.ABLE) {
      return { ok: false, reason: `eligibility_${eligibility || "unknown"}` };
    }
    if (!business?.claim_invite_sent_at) {
      return { ok: false, reason: "claim_invite_not_sent" };
    }
    if (!isClaimInviteOldEnoughForFollowup(business.claim_invite_sent_at)) {
      return { ok: false, reason: "claim_invite_too_recent" };
    }
    if (business?.claim_followup_sent_at) {
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

  if (outreachType === OUTREACH_TYPES.CUSTOM_CLAIM_INVITE) {
    return {
      subject: CUSTOM_CLAIM_INVITE_OUTREACH_MESSAGE.subject(businessName),
      html: CUSTOM_CLAIM_INVITE_OUTREACH_MESSAGE.html(businessName, {
        businessPageUrl,
        howToClaimUrl,
      }),
    };
  }

  if (outreachType === OUTREACH_TYPES.CLAIM_FOLLOWUP) {
    return {
      subject: CLAIM_FOLLOWUP_OUTREACH_MESSAGE.subject(businessName),
      html: CLAIM_FOLLOWUP_OUTREACH_MESSAGE.html(businessName, {
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

function appendOutreachUnsubscribeFooter(html, unsubscribeUrl) {
  if (!unsubscribeUrl) return html;
  return `${html}
  <hr style="border: none; border-top: 1px solid #e6ebf0; margin: 24px 0 12px;">
  <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5; color: #667788;">
    Don't want emails about this listing (claim invites, follow-ups, or weekly reports)?
    <a href="${unsubscribeUrl}" style="color: #1a73e8; text-decoration: underline;">Unsubscribe</a>
  </p>`;
}

export function buildOutreachUnsubscribeUrls(businessId, email) {
  const token = signUnsubscribeToken({
    businessId,
    email,
    type: EMAIL_SUPPRESSION_TYPES.BUSINESS_EMAIL,
  });
  return {
    unsubscribeUrl: buildUnsubscribeUrl(token, getWebBaseUrl()),
    oneClickUnsubscribeUrl: buildOneClickUnsubscribeUrl(token, getWebBaseUrl()),
  };
}

export const buildOutreachEmailPayload = ({
  business,
  outreachType,
  recipient,
  senderEmail,
}) => {
  const content = buildOutreachEmailContent(business, outreachType);
  if (!content) return null;

  const { unsubscribeUrl, oneClickUnsubscribeUrl } =
    buildOutreachUnsubscribeUrls(business.id, recipient);
  const deliveryTo = resolveOutreachRecipientEmail(recipient);
  const subject = isOutreachDevRedirect()
    ? `[DEV] ${content.subject}`
    : content.subject;

  return {
    from: `${SENDER_NAME} <${senderEmail}>`,
    to: [deliveryTo],
    subject,
    html: appendOutreachUnsubscribeFooter(content.html, unsubscribeUrl),
    headers: {
      "List-Unsubscribe": `<${oneClickUnsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
};
