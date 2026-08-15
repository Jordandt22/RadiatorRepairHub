import {
  CLAIM_ELIGIBILITY_LABELS,
  isClaimInviteOutreachType,
} from "@/components/pages/outreach/outreachConstants";

export const CLAIM_FOLLOWUP_MIN_DAYS_SINCE_INVITE = 7;

export const OUTREACH_SKIP_REASON_LABELS = {
  not_found: "Not found",
  already_sent: "Already sent",
  has_website: "Has website",
  missing_recipient: "Missing recipient",
  invalid_outreach_type: "Invalid type",
  already_added: "Already added",
  claim_invite_not_sent: "No claim invite sent",
  claim_invite_too_recent: "Claim invite sent less than 7 days ago",
  eligibility_able: "Eligibility: Able",
  eligibility_no_email: "No email",
  eligibility_email_review: "Email review",
  eligibility_duplicate_email: "Duplicate email",
  eligibility_claimed: "Claimed",
  eligibility_unknown: "Unknown eligibility",
};

export function formatOutreachSkipReason(reason) {
  if (!reason) return "Skipped";
  if (OUTREACH_SKIP_REASON_LABELS[reason]) {
    return OUTREACH_SKIP_REASON_LABELS[reason];
  }
  if (reason.startsWith("eligibility_")) {
    const key = reason.replace("eligibility_", "");
    return `Eligibility: ${CLAIM_ELIGIBILITY_LABELS[key] ?? key}`;
  }
  return reason;
}

function resolveRecipient(business) {
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
}

function hasWebsite(business) {
  const website =
    typeof business?.website === "string" ? business.website.trim() : "";
  return Boolean(website);
}

function isClaimInviteOldEnoughForFollowup(claimInviteSentAt, now = new Date()) {
  if (!claimInviteSentAt) return false;
  const sentAt = new Date(claimInviteSentAt);
  if (Number.isNaN(sentAt.getTime())) return false;
  const minMs = CLAIM_FOLLOWUP_MIN_DAYS_SINCE_INVITE * 24 * 60 * 60 * 1000;
  return now.getTime() - sentAt.getTime() >= minMs;
}

/** Mirrors server evaluateOutreachEligibility for UI display. */
export function evaluateOutreachEligibilityClient(business, outreachType) {
  const eligibility = business?.claim_eligibility;

  if (isClaimInviteOutreachType(outreachType)) {
    if (eligibility !== "able") {
      return { ok: false, reason: `eligibility_${eligibility || "unknown"}` };
    }
    if (business?.claim_invite_sent_at) {
      return { ok: false, reason: "already_sent" };
    }
    if (!resolveRecipient(business)) {
      return { ok: false, reason: "missing_recipient" };
    }
    return { ok: true, reason: null };
  }

  if (outreachType === "claim_followup") {
    if (eligibility !== "able") {
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
    if (!resolveRecipient(business)) {
      return { ok: false, reason: "missing_recipient" };
    }
    return { ok: true, reason: null };
  }

  if (outreachType === "website_offer") {
    if (eligibility !== "able" && eligibility !== "claimed") {
      return { ok: false, reason: `eligibility_${eligibility || "unknown"}` };
    }
    if (hasWebsite(business)) {
      return { ok: false, reason: "has_website" };
    }
    if (business?.website_offer_sent_at) {
      return { ok: false, reason: "already_sent" };
    }
    if (!resolveRecipient(business)) {
      return { ok: false, reason: "missing_recipient" };
    }
    return { ok: true, reason: null };
  }

  return { ok: false, reason: "invalid_outreach_type" };
}
