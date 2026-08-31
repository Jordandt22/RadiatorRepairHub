import { isEmailUnderReview } from "@/lib/emailStatus";

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
