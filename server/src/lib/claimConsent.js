/**
 * Phone-claim consent copy and version. Keep in sync with
 * client/src/lib/claimConsent.js — the version is stored on each
 * claim_consent_events row for audit.
 */
export const PHONE_CLAIM_CONSENT_VERSION = "phone_claim_v2";

export const PHONE_CLAIM_CONSENT_TEXT =
  "I certify that I am the owner or an authorized representative of this business, and I expressly consent to receive an automated verification call using a prerecorded or artificial voice at the number listed above to verify my listing.";

export const PHONE_CLAIM_RESEND_CONSENT_TEXT =
  "I consent to receive one more automated verification call using a prerecorded or artificial voice at this business's phone number.";
