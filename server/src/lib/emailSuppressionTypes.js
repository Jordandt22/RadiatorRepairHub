export const EMAIL_SUPPRESSION_TYPES = Object.freeze({
  WEEKLY_DIGEST: "weekly_digest",
  BUSINESS_EMAIL: "business_email",
});

/** Types that block outreach + weekly digests (not Quick Contact). */
export const BULK_EMAIL_SUPPRESSION_TYPES = Object.freeze([
  EMAIL_SUPPRESSION_TYPES.WEEKLY_DIGEST,
  EMAIL_SUPPRESSION_TYPES.BUSINESS_EMAIL,
]);
