import test from "node:test";
import assert from "node:assert/strict";
import {
  DIGEST_TIERS,
  buildWeeklyDigestStats,
  evaluateDigestEligibility,
  hasUnclaimedDigestActivity,
  pickUnclaimedDigestStats,
} from "./weeklyDigestStats.js";

const stats = {
  startDate: "2026-08-26",
  endDate: "2026-09-01",
  totals: {
    page_views: 10,
    impressions: 20,
    listing_clicks: 5,
    phone_clicks: 3,
    directions_clicks: 2,
  },
  ctr: 25,
  avgPosition: 4.2,
  impressionsBySource: { search: 20 },
  comparison: {
    totals: {
      page_views: { previous: 8, change: 2, percent: 25 },
      impressions: { previous: 12, change: 8, percent: 66.7 },
      phone_clicks: { previous: 1, change: 2, percent: 200 },
    },
  },
};

test("unclaimed picker keeps only headline stats", () => {
  assert.deepEqual(pickUnclaimedDigestStats(stats), {
    impressions: 20,
    page_views: 10,
    phone_clicks: 3,
  });
  assert.equal(hasUnclaimedDigestActivity(stats), true);
  assert.equal(
    hasUnclaimedDigestActivity({ totals: { impressions: 0, page_views: 0, phone_clicks: 0 } }),
    false
  );
});

test("unclaimed digest stats stay gated to three totals", () => {
  const digest = buildWeeklyDigestStats(stats, { is_claimed: false });
  assert.equal(digest.tier, DIGEST_TIERS.UNCLAIMED);
  assert.deepEqual(digest.totals, {
    impressions: 20,
    page_views: 10,
    phone_clicks: 3,
  });
  assert.equal(digest.hasCallButtonInterest, true);
  assert.equal(digest.ctr, null);
});

test("claimed basic digest hides featured metrics but keeps call interest flag", () => {
  const digest = buildWeeklyDigestStats(stats, {
    is_claimed: true,
    is_featured: false,
  });
  assert.equal(digest.tier, DIGEST_TIERS.CLAIMED_BASIC);
  assert.equal(digest.totals.page_views, 10);
  assert.equal(digest.totals.phone_clicks, undefined);
  assert.equal(digest.hasCallButtonInterest, true);
  assert.equal(digest.ctr, null);
});

test("featured digest keeps full stats", () => {
  const digest = buildWeeklyDigestStats(stats, {
    is_claimed: true,
    is_featured: true,
  });
  assert.equal(digest.tier, DIGEST_TIERS.FEATURED);
  assert.equal(digest.totals.phone_clicks, 3);
  assert.equal(digest.hasCallButtonInterest, true);
  assert.equal(digest.ctr, 25);
});

test("evaluateDigestEligibility skips zero-activity unclaimed and missing recipients", () => {
  const unclaimed = {
    is_claimed: false,
    claim_eligibility: "able",
    email: "shop@example.com",
  };
  assert.equal(
    evaluateDigestEligibility(unclaimed, "unclaimed", {
      stats: { totals: { impressions: 0, page_views: 0, phone_clicks: 0 } },
    }).reason,
    "zero_activity"
  );
  assert.equal(
    evaluateDigestEligibility(
      { ...unclaimed, email: null },
      "unclaimed",
      { stats }
    ).reason,
    "missing_recipient"
  );
  assert.equal(
    evaluateDigestEligibility(unclaimed, "unclaimed", { stats }).ok,
    true
  );
});

test("evaluateDigestEligibility skips suppressed recipients", () => {
  assert.equal(
    evaluateDigestEligibility(
      {
        is_claimed: true,
        weekly_digest_enabled: true,
        email: "shop@example.com",
      },
      "claimed",
      { isSuppressed: true }
    ).reason,
    "suppressed"
  );
});

test("evaluateDigestEligibility honors claimed digest preference", () => {
  const claimed = {
    is_claimed: true,
    weekly_digest_enabled: false,
    email: "shop@example.com",
  };
  assert.equal(
    evaluateDigestEligibility(claimed, "claimed").reason,
    "digest_disabled"
  );
  assert.equal(
    evaluateDigestEligibility(
      { ...claimed, weekly_digest_enabled: true },
      "claimed"
    ).ok,
    true
  );
});
