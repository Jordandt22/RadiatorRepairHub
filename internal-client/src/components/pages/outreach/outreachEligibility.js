import { CLAIM_ELIGIBILITY_LABELS } from "@/components/pages/outreach/outreachConstants";

export const OUTREACH_SKIP_REASON_LABELS = {
  not_found: "Not found",
  already_sent: "Already sent",
  has_website: "Has website",
  missing_recipient: "Missing recipient",
  invalid_outreach_type: "Invalid type",
  already_added: "Already added",
  eligibility_able: "Eligibility: Able",
  eligibility_no_email: "No email",
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

/** Mirrors server evaluateOutreachEligibility for UI display. */
export function evaluateOutreachEligibilityClient(business, outreachType) {
  const eligibility = business?.claim_eligibility;

  if (outreachType === "claim_invite") {
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
