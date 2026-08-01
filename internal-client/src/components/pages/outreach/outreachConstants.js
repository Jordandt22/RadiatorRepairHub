/** Max businesses in the Sender working set (matched + manual). */
export const OUTREACH_SEND_SELECTION_CAP = 75;

/** Options for Select matching only (not the total send cap). */
export const OUTREACH_LIMIT_OPTIONS = [
  { id: "10", label: "10", value: 10 },
  { id: "25", label: "25", value: 25 },
  { id: "50", label: "50", value: 50 },
];

export const OUTREACH_TYPE_OPTIONS = [
  { id: "claim_invite", label: "Claim invite" },
  { id: "website_offer", label: "Website offer" },
];

export const CLAIM_ELIGIBILITY_FILTERS = [
  { id: "able", label: "Able" },
  { id: "no_email", label: "No Email" },
  { id: "duplicate_email", label: "Duplicate Email" },
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

export const CLAIM_ELIGIBILITY_LABELS = {
  able: "Able",
  no_email: "No Email",
  duplicate_email: "Duplicate Email",
  claimed: "Claimed",
};

export const OUTREACH_TYPE_LABELS = {
  claim_invite: "Claim invite",
  website_offer: "Website offer",
};
