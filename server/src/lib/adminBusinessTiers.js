export const SCORE_TIERS = [
  { id: "lt-3", label: "Less than 3", min: null, max: 3 },
  { id: "3-3.5", label: "3 – 3.5", min: 3, max: 3.5 },
  { id: "3.5-4", label: "3.5 – 4", min: 3.5, max: 4 },
  { id: "4-4.5", label: "4 – 4.5", min: 4, max: 4.5 },
  { id: "gte-4.5", label: "4.5 and above", min: 4.5, max: null },
];

export const REVIEW_TIERS = [
  { id: "lt-5", label: "Less than 5", min: null, max: 5 },
  { id: "5-15", label: "5 – 15", min: 5, max: 15 },
  { id: "15-30", label: "15 – 30", min: 15, max: 30 },
  { id: "30-50", label: "30 – 50", min: 30, max: 50 },
  { id: "gte-50", label: "50 and above", min: 50, max: null },
];

export const EMAIL_FILTERS = [
  { id: "has", label: "Has email" },
  { id: "none", label: "No email" },
];

export const WEBSITE_FILTERS = [
  { id: "has", label: "Has website" },
  { id: "none", label: "No website" },
];

export const PHONE_FILTERS = [
  { id: "has", label: "Has phone" },
  { id: "none", label: "No phone" },
];

export const PHONE_STATUS_FILTERS = [
  { id: "not_checked", label: "Not checked" },
  { id: "checked", label: "Checked" },
  { id: "suspicious", label: "Suspicious" },
  { id: "unable_to_find", label: "Unable to find" },
];

/** Call Only is landline or toll-free. Both is a number that can be called or texted. */
export const PHONE_REACH_FILTERS = [
  { id: "call_only", label: "Call Only" },
  { id: "both", label: "Both" },
];

export const PHONE_REACH_LINE_TYPES = {
  call_only: ["landline", "tollFree"],
  both: ["mobile", "fixedVoip", "nonFixedVoip"],
};

export const PHONE_LINE_TYPE_FILTERS = [
  { id: "unchecked", label: "Not checked" },
  { id: "empty", label: "Checked, no type" },
  { id: "landline", label: "Landline" },
  { id: "mobile", label: "Mobile" },
  { id: "fixedVoip", label: "Fixed VoIP" },
  { id: "nonFixedVoip", label: "Non-fixed VoIP" },
  { id: "tollFree", label: "Toll-free" },
  { id: "personal", label: "Personal" },
  { id: "unknown", label: "Unknown" },
  { id: "premium", label: "Premium" },
  { id: "sharedCost", label: "Shared cost" },
  { id: "uan", label: "UAN" },
  { id: "voicemail", label: "Voicemail" },
  { id: "pager", label: "Pager" },
];

export const SCORE_TIER_IDS = SCORE_TIERS.map((t) => t.id);
export const REVIEW_TIER_IDS = REVIEW_TIERS.map((t) => t.id);
export const EMAIL_FILTER_IDS = EMAIL_FILTERS.map((t) => t.id);
export const WEBSITE_FILTER_IDS = WEBSITE_FILTERS.map((t) => t.id);
export const PHONE_FILTER_IDS = PHONE_FILTERS.map((t) => t.id);
export const PHONE_STATUS_FILTER_IDS = PHONE_STATUS_FILTERS.map((t) => t.id);
export const PHONE_LINE_TYPE_FILTER_IDS = PHONE_LINE_TYPE_FILTERS.map((t) => t.id);
export const PHONE_REACH_FILTER_IDS = PHONE_REACH_FILTERS.map((t) => t.id);

export const CLAIM_FILTERS = [
  { id: "claimed", label: "Claimed" },
  { id: "unclaimed", label: "Unclaimed" },
];

export const CLAIM_FILTER_IDS = CLAIM_FILTERS.map((t) => t.id);

export function getScoreTier(id) {
  return SCORE_TIERS.find((t) => t.id === id) ?? null;
}

export function getReviewTier(id) {
  return REVIEW_TIERS.find((t) => t.id === id) ?? null;
}
