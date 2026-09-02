import { gateOwnedBusinessStats } from "./gateOwnedBusinessStats.js";
import { resolveNotificationRecipient } from "./notificationRecipient.js";

export const WEEKLY_DIGEST_DAYS = 7;
export const WEEKLY_DIGEST_PERIOD_LABEL = "Last 7 days";

export const DIGEST_SEGMENTS = Object.freeze({
  UNCLAIMED: "unclaimed",
  CLAIMED: "claimed",
});

export const DIGEST_TIERS = Object.freeze({
  UNCLAIMED: "unclaimed",
  CLAIMED_BASIC: "claimed_basic",
  FEATURED: "featured",
});

function numberOrZero(value) {
  return Number(value || 0);
}

export function getDigestTier(business) {
  if (business?.is_claimed) {
    return business.is_featured ? DIGEST_TIERS.FEATURED : DIGEST_TIERS.CLAIMED_BASIC;
  }
  return DIGEST_TIERS.UNCLAIMED;
}

export function pickUnclaimedDigestStats(stats) {
  const totals = stats?.totals ?? {};
  return {
    impressions: numberOrZero(totals.impressions),
    page_views: numberOrZero(totals.page_views),
    phone_clicks: numberOrZero(totals.phone_clicks),
  };
}

export function hasUnclaimedDigestActivity(stats) {
  return hasDigestActivity(stats);
}

export function hasDigestActivity(stats) {
  const picked = pickUnclaimedDigestStats(stats);
  return (
    picked.impressions > 0 ||
    picked.page_views > 0 ||
    picked.phone_clicks > 0
  );
}

export function buildWeeklyDigestStats(stats, business) {
  const tier = getDigestTier(business);
  const hasCallButtonInterest =
    numberOrZero(stats?.totals?.phone_clicks) > 0;

  if (tier === DIGEST_TIERS.UNCLAIMED) {
    return {
      tier,
      periodLabel: WEEKLY_DIGEST_PERIOD_LABEL,
      days: WEEKLY_DIGEST_DAYS,
      startDate: stats?.startDate ?? null,
      endDate: stats?.endDate ?? null,
      totals: pickUnclaimedDigestStats(stats),
      hasCallButtonInterest,
      impressionsBySource: null,
      comparison: null,
      ctr: null,
      avgPosition: null,
    };
  }

  const gated = gateOwnedBusinessStats(stats, tier === DIGEST_TIERS.FEATURED);
  return {
    tier,
    periodLabel: WEEKLY_DIGEST_PERIOD_LABEL,
    days: WEEKLY_DIGEST_DAYS,
    startDate: gated?.startDate ?? null,
    endDate: gated?.endDate ?? null,
    totals: gated?.totals ?? {},
    hasCallButtonInterest,
    impressionsBySource: gated?.impressionsBySource ?? null,
    comparison: gated?.comparison ?? null,
    ctr: gated?.ctr ?? null,
    avgPosition: gated?.avgPosition ?? null,
    clicksBySource: gated?.clicksBySource ?? null,
  };
}

export function evaluateDigestEligibility(
  business,
  digestSegment,
  { stats = null, isSuppressed = false, ownerAuthEmail = null } = {}
) {
  const recipient = resolveNotificationRecipient(business, ownerAuthEmail);
  if (!recipient) {
    return { ok: false, reason: "missing_recipient" };
  }
  if (isSuppressed) {
    return { ok: false, reason: "suppressed" };
  }

  if (digestSegment === DIGEST_SEGMENTS.UNCLAIMED) {
    if (business?.is_claimed) {
      return { ok: false, reason: "already_claimed" };
    }
    if (business?.claim_eligibility && business.claim_eligibility !== "able") {
      return { ok: false, reason: `eligibility_${business.claim_eligibility}` };
    }
    if (stats && !hasDigestActivity(stats)) {
      return { ok: false, reason: "zero_activity" };
    }
    return { ok: true, recipient, tier: DIGEST_TIERS.UNCLAIMED };
  }

  if (digestSegment === DIGEST_SEGMENTS.CLAIMED) {
    if (!business?.is_claimed) {
      return { ok: false, reason: "not_claimed" };
    }
    if (business.weekly_digest_enabled === false) {
      return { ok: false, reason: "digest_disabled" };
    }
    if (stats && !hasDigestActivity(stats)) {
      return { ok: false, reason: "zero_activity" };
    }
    return { ok: true, recipient, tier: getDigestTier(business) };
  }

  return { ok: false, reason: "invalid_digest_segment" };
}
