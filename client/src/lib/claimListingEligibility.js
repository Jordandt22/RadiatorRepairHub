import {
  EMAIL_UNDER_REVIEW_MESSAGE,
  isEmailUnderReview,
} from "@/lib/emailStatus";

export function isClaimListingEligible({
  isClaimed = false,
  email = null,
  emailStatus = null,
  hasDuplicateEmail = false,
} = {}) {
  if (isClaimed) return false;

  const hasEmail =
    typeof email === "string" ? Boolean(email.trim()) : Boolean(email);

  if (isEmailUnderReview(emailStatus)) return false;
  if (!hasEmail) return false;
  if (hasDuplicateEmail) return false;

  return true;
}

/**
 * Phone eligibility is decided by the API (it needs the shop's timezone, hours,
 * and shared-phone status), so the client just reads the returned flags.
 * In development, call-hour / timezone gates are ignored to match the API.
 */
export function isPhoneClaimListingEligible({
  isClaimed = false,
  phoneClaimEligible = false,
  phoneClaimBlockReason = null,
} = {}) {
  if (isClaimed) return false;
  if (Boolean(phoneClaimEligible)) return true;

  if (
    process.env.NODE_ENV === "development" &&
    (phoneClaimBlockReason === "outside_hours" ||
      phoneClaimBlockReason === "no_timezone")
  ) {
    return true;
  }

  return false;
}

/** Short, user-facing explanation for why email claiming is unavailable. */
export const EMAIL_CLAIM_BLOCK_REASONS = {
  no_email: "This listing has no email on file.",
  email_under_review: EMAIL_UNDER_REVIEW_MESSAGE,
  shared_email: "This email is shared with other listings.",
};

/** Short, user-facing explanation for why phone claiming is unavailable. */
export const PHONE_CLAIM_BLOCK_REASONS = {
  no_phone: "This listing has no phone number on file.",
  invalid_phone: "This listing's phone number can't receive verification calls.",
  filtered_phone: "This listing's phone number can't receive verification calls.",
  shared_phone: "This phone number is shared with other listings.",
  no_timezone: "Phone verification isn't available for this listing.",
  outside_hours:
    "Verification calls are only placed during business hours (9:00 AM to 5:00 PM local time).",
};

export function getEmailClaimBlockReason({
  email = null,
  emailStatus = null,
  hasDuplicateEmail = false,
} = {}) {
  const hasEmail =
    typeof email === "string" ? Boolean(email.trim()) : Boolean(email);

  if (isEmailUnderReview(emailStatus)) return "email_under_review";
  if (!hasEmail) return "no_email";
  if (hasDuplicateEmail) return "shared_email";
  return null;
}

export function getEmailClaimBlockMessage(reason) {
  return EMAIL_CLAIM_BLOCK_REASONS[reason] ?? null;
}

export function getPhoneClaimBlockMessage(reason) {
  return PHONE_CLAIM_BLOCK_REASONS[reason] ?? null;
}

/**
 * Short Unclaimable subtitle. Prefer the phone block reason — listings almost
 * always have a phone, so "No Email" alone is misleading when phone is also blocked.
 */
export const UNCLAIMABLE_PHONE_REASON_LABELS = {
  no_phone: "No Phone",
  invalid_phone: "Phone can't receive verification calls",
  filtered_phone: "Phone can't receive verification calls",
  shared_phone: "Multiple Businesses have this Phone",
  no_timezone: "Phone verification unavailable",
  outside_hours: "Outside call hours (9 AM–5 PM local)",
};

export function getUnclaimableListingReason({
  phoneClaimBlockReason = null,
  email = null,
  emailStatus = null,
  hasDuplicateEmail = false,
} = {}) {
  if (phoneClaimBlockReason) {
    return (
      UNCLAIMABLE_PHONE_REASON_LABELS[phoneClaimBlockReason] ??
      getPhoneClaimBlockMessage(phoneClaimBlockReason) ??
      "Phone verification unavailable"
    );
  }

  const emailReason = getEmailClaimBlockReason({
    email,
    emailStatus,
    hasDuplicateEmail,
  });
  if (emailReason === "email_under_review") return EMAIL_UNDER_REVIEW_MESSAGE;
  if (emailReason === "shared_email") return "Multiple Businesses have this Email";
  if (emailReason === "no_email") return "No Email";

  return "Not eligible to claim";
}

/**
 * Show the claim entry point when either channel can start a claim, or when
 * phone is only blocked by call hours so owners can still open the dialog and
 * read why the call option is waiting.
 */
export function canClaimListing({
  isClaimed = false,
  email = null,
  emailStatus = null,
  hasDuplicateEmail = false,
  phoneClaimEligible = false,
  phoneClaimBlockReason = null,
} = {}) {
  if (isClaimed) return false;

  return (
    isClaimListingEligible({ isClaimed, email, emailStatus, hasDuplicateEmail }) ||
    isPhoneClaimListingEligible({
      isClaimed,
      phoneClaimEligible,
      phoneClaimBlockReason,
    }) ||
    phoneClaimBlockReason === "outside_hours"
  );
}
