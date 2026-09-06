/**
 * Heuristics for admin phone cleaner — flags numbers that likely need review.
 * Returns stable reason codes; UI maps them to labels.
 */

import {
  getLocalClaimPhoneBlockReason,
  CLAIM_PHONE_BLOCK_REASONS,
} from "./claimPhone.js";

export const getSuspiciousPhoneReasons = (phone) => {
  const reasons = [];
  const trimmed = typeof phone === "string" ? phone.trim() : "";
  if (!trimmed) {
    reasons.push("empty");
    return reasons;
  }

  const localReason = getLocalClaimPhoneBlockReason(trimmed);
  if (localReason === CLAIM_PHONE_BLOCK_REASONS.INVALID_PHONE) {
    reasons.push("invalid");
  } else if (localReason === CLAIM_PHONE_BLOCK_REASONS.FILTERED_PHONE) {
    reasons.push("filtered");
  }

  return reasons;
};
