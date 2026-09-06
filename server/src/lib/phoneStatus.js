export const PHONE_STATUS = Object.freeze({
  SUSPICIOUS: "suspicious",
  CHECKED: "checked",
  UNABLE_TO_FIND: "unable_to_find",
  NOT_CHECKED: "not_checked",
});

export const PHONE_UNDER_REVIEW_MESSAGE =
  "This phone number is being reviewed.";

export const isPhoneUnderReview = (phoneStatus) =>
  phoneStatus === PHONE_STATUS.SUSPICIOUS;
