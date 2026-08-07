/** Max businesses in the Sender working set (matched + manual). */
export const OUTREACH_SEND_SELECTION_CAP = 75;

/** Options for Select matching only (not the total send cap). */
export const OUTREACH_LIMIT_OPTIONS = [
  { id: "10", label: "10", value: 10 },
  { id: "25", label: "25", value: 25 },
  { id: "50", label: "50", value: 50 },
];

export const OUTREACH_TYPE_OPTIONS = [
  { id: "claim_invite", label: "Claim invite (website)" },
  { id: "ownership_claim_invite", label: "Claim invite (ownership)" },
  { id: "lead_claim_invite", label: "Claim invite (leads)" },
  { id: "claim_followup", label: "Claim follow-up" },
  { id: "website_offer", label: "Website offer" },
];

export const CLAIM_ELIGIBILITY_FILTERS = [
  { id: "able", label: "Able" },
  { id: "no_email", label: "No contact" },
  { id: "duplicate_email", label: "Duplicate contact" },
  { id: "claimed", label: "Claimed" },
];

export const WEBSITE_FILTERS = [
  { id: "has", label: "Has website" },
  { id: "none", label: "No website" },
];

export const SENT_FILTERS = [
  { id: "true", label: "Sent" },
  { id: "false", label: "Not sent" },
];

export const HISTORY_EMAIL_FILTERS = [
  { id: "email_changed_or_missing", label: "Contact changed/missing" },
  { id: "same_email", label: "Same contact" },
];

export const CLAIM_ELIGIBILITY_LABELS = {
  able: "Able",
  no_email: "No contact",
  duplicate_email: "Duplicate contact",
  claimed: "Claimed",
};

export const OUTREACH_TYPE_LABELS = {
  claim_invite: "Claim invite (website)",
  ownership_claim_invite: "Claim invite (ownership)",
  lead_claim_invite: "Claim invite (leads)",
  claim_followup: "Claim follow-up",
  website_offer: "Website offer",
};

export const CLAIM_INVITE_OUTREACH_TYPES = [
  "claim_invite",
  "ownership_claim_invite",
  "lead_claim_invite",
];

export const isClaimInviteOutreachType = (outreachType) =>
  CLAIM_INVITE_OUTREACH_TYPES.includes(outreachType);
