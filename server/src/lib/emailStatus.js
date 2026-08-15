export const EMAIL_STATUS = Object.freeze({
  SUSPICIOUS: "suspicious",
  CHECKED: "checked",
  UNABLE_TO_FIND: "unable_to_find",
  NOT_CHECKED: "not_checked",
});

export const EMAIL_UNDER_REVIEW_MESSAGE = "This email is being reviewed.";

export const isEmailUnderReview = (emailStatus) =>
  emailStatus === EMAIL_STATUS.SUSPICIOUS;
