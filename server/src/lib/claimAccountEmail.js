export const normalizeClaimAccountEmail = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

/**
 * Login email for a claim. A signed-in owner keeps their account email.
 * Unsigned phone claims use the address they typed. Unsigned email claims
 * use the address they typed, or the listing email when they leave the default.
 */
export const resolveClaimAccountEmail = ({
  isPhoneClaim = false,
  submittedEmail = "",
  authenticatedEmail = "",
  listingEmail = "",
} = {}) => {
  const authenticated = normalizeClaimAccountEmail(authenticatedEmail);
  if (authenticated) return authenticated;

  const submitted = normalizeClaimAccountEmail(submittedEmail);
  if (isPhoneClaim) return submitted;

  return submitted || normalizeClaimAccountEmail(listingEmail);
};

/**
 * True when the account email is the inbox that received the email-claim code.
 * Phone claims have no listing inbox, so they are never treated as verified here.
 */
export const isVerifiedListingAccountEmail = ({
  isPhoneClaim = false,
  accountEmail = "",
  listingEmail = "",
} = {}) => {
  if (isPhoneClaim) return false;

  const account = normalizeClaimAccountEmail(accountEmail);
  const listing = normalizeClaimAccountEmail(listingEmail);
  return Boolean(account && listing && account === listing);
};
