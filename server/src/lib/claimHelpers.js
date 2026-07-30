import {
  getClaimRequestCodeKey,
  deleteCacheData,
} from "../redis/redis.js";
import {
  updateClaimRequestStatus,
  getPendingClaimRequestsForBusiness,
  expireClaimRequestsByIds,
} from "../supabase/supabase.functions.js";

export const MAX_CLAIM_ATTEMPTS = 5;
export const CLAIM_STALE_MS = 1 * 24 * 60 * 60 * 1000;
export const CLAIM_RESTART_MESSAGE =
  "This claim request has expired. Please restart the claim process from the business page.";
export const CLAIM_MAX_ATTEMPTS_MESSAGE =
  "Too many attempts. Please restart the claim process from the business page.";

export const isClaimStale = (claim) => {
  if (!claim?.last_attempted_at) return false;
  const lastAttemptedAt = new Date(claim.last_attempted_at).getTime();
  if (Number.isNaN(lastAttemptedAt)) return false;
  return Date.now() - lastAttemptedAt > CLAIM_STALE_MS;
};

export const clearClaimCodeCache = async (claim_request_id) => {
  try {
    const { key } = getClaimRequestCodeKey(claim_request_id);
    await deleteCacheData(key);
  } catch {
    // best-effort cleanup
  }
};

export const expireStaleClaimIfNeeded = async (claim) => {
  if (!isClaimStale(claim)) return false;
  await updateClaimRequestStatus(claim.claim_request_id, "expired");
  await clearClaimCodeCache(claim.claim_request_id);
  return true;
};

export const failClaimForMaxAttempts = async (claim_request_id) => {
  await updateClaimRequestStatus(claim_request_id, "failed");
  await clearClaimCodeCache(claim_request_id);
};

/**
 * Expires pending claim requests for a business when last_attempted_at is stale.
 * Returns { error, expiredIds, remainingPending }.
 */
export const expireStalePendingClaimsForBusiness = async (business_id) => {
  const { data: pendingClaims, error: pendingError } =
    await getPendingClaimRequestsForBusiness(business_id);

  if (pendingError) {
    return { error: pendingError, expiredIds: [], remainingPending: [] };
  }

  const pending = pendingClaims || [];
  const staleClaims = pending.filter(isClaimStale);
  const remainingPending = pending.filter((claim) => !isClaimStale(claim));

  if (staleClaims.length === 0) {
    return { error: null, expiredIds: [], remainingPending };
  }

  const staleIds = staleClaims.map((claim) => claim.claim_request_id);
  const { error: expireError } = await expireClaimRequestsByIds(staleIds);

  if (expireError) {
    return { error: expireError, expiredIds: [], remainingPending: pending };
  }

  await Promise.all(staleIds.map((id) => clearClaimCodeCache(id)));

  return { error: null, expiredIds: staleIds, remainingPending };
};
