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
  { id: "custom_claim_invite", label: "Claim invite (custom)" },
  { id: "claim_followup", label: "Claim follow-up" },
  { id: "website_offer", label: "Website offer" },
  { id: "sms_claim_invite", label: "SMS claim invite" },
  { id: "sms_claim_followup", label: "SMS claim follow-up" },
  { id: "sms_custom_claim_invite", label: "SMS claim invite (custom)" },
  { id: "sms_declined", label: "SMS declined" },
];

/** Sender campaigns only — custom is recorded via Mark Sent on All. */
export const OUTREACH_SENDER_TYPE_OPTIONS = OUTREACH_TYPE_OPTIONS.filter(
  (option) =>
    option.id !== "custom_claim_invite" && !option.id.startsWith("sms_"),
);

/** Email Mark Sent dialog — exclude SMS history types. */
export const OUTREACH_EMAIL_TYPE_OPTIONS = OUTREACH_TYPE_OPTIONS.filter(
  (option) => !option.id.startsWith("sms_"),
);

/** Manual SMS campaigns, texted by hand from Google Voice. */
export const OUTREACH_SMS_TYPE_OPTIONS = [
  { id: "sms_claim_invite", label: "SMS claim invite" },
  { id: "sms_claim_followup", label: "SMS claim follow-up" },
  { id: "sms_custom_claim_invite", label: "Custom" },
];

/** Matches OUTREACH_SMS_BODY_MAX on the server. */
export const OUTREACH_SMS_BODY_MAX = 480;

/** Texts can only reach listings with a usable phone number. */
export const SMS_ELIGIBILITY_FILTERS = [
  { id: "phone_able", label: "Phone able" },
  { id: "both_able", label: "Both able" },
];

export const SMS_DECLINED_FILTERS = [
  { id: "false", label: "Not declined" },
  { id: "true", label: "Declined" },
];

export const CLAIM_ELIGIBILITY_FILTERS = [
  { id: "both_able", label: "Both able" },
  { id: "email_able", label: "Email able" },
  { id: "phone_able", label: "Phone able" },
  { id: "no_contact", label: "No contact" },
  { id: "email_review", label: "Email review" },
  { id: "phone_review", label: "Phone review" },
  { id: "duplicate_email", label: "Duplicate email" },
  { id: "duplicate_phone", label: "Duplicate phone" },
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

export const HISTORY_CHANNEL_FILTERS = [
  { id: "email", label: "Email" },
  { id: "phone", label: "SMS" },
];

export const CLAIM_ELIGIBILITY_LABELS = {
  both_able: "Both able",
  email_able: "Email able",
  phone_able: "Phone able",
  no_contact: "No contact",
  email_review: "Email review",
  phone_review: "Phone review",
  duplicate_email: "Duplicate email",
  duplicate_phone: "Duplicate phone",
  claimed: "Claimed",
};

export const OUTREACH_TYPE_LABELS = {
  claim_invite: "Claim invite (website)",
  ownership_claim_invite: "Claim invite (ownership)",
  lead_claim_invite: "Claim invite (leads)",
  custom_claim_invite: "Claim invite (custom)",
  claim_followup: "Claim follow-up",
  website_offer: "Website offer",
  sms_claim_invite: "SMS claim invite",
  sms_claim_followup: "SMS claim follow-up",
  sms_custom_claim_invite: "SMS claim invite (custom)",
  sms_declined: "SMS declined",
};

export const CLAIM_INVITE_OUTREACH_TYPES = [
  "claim_invite",
  "ownership_claim_invite",
  "lead_claim_invite",
  "custom_claim_invite",
];

export const isClaimInviteOutreachType = (outreachType) =>
  CLAIM_INVITE_OUTREACH_TYPES.includes(outreachType);

export const isEmailChannelClaimEligible = (eligibility) =>
  eligibility === "both_able" || eligibility === "email_able";
