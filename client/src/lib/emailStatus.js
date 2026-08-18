export const EMAIL_UNDER_REVIEW_MESSAGE = "This email is being reviewed.";

export const isEmailUnderReview = (emailStatus) => emailStatus === "suspicious";

export const isEmailUnverified = (emailStatus, { isClaimed = false } = {}) =>
  emailStatus === "not_checked" && !isClaimed;
