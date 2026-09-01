import test from "node:test";
import assert from "node:assert/strict";
import { gateOwnedBusinessStats } from "./gateOwnedBusinessStats.js";

const fullStats = {
  days: 7,
  daily: [
    {
      stat_date: "2026-09-01",
      page_views: 4,
      listing_clicks: 2,
      impressions_search: 10,
    },
  ],
  totals: {
    page_views: 10,
    listing_clicks: 5,
    impressions: 20,
    phone_clicks: 3,
    directions_clicks: 2,
    website_clicks: 1,
    email_clicks: 0,
  },
  ctr: 25,
  avgPosition: 4.5,
  impressionsBySource: { search: 20 },
  clicksBySource: { search: 5 },
  ctrBySource: { search: 25 },
  avgPositionBySource: { search: 4.5 },
  comparison: {
    label: "previous 7 days",
    totals: {
      page_views: { previous: 8, change: 2, percent: 25 },
      listing_clicks: { previous: 3, change: 2, percent: 66.7 },
      impressions: { previous: 15, change: 5, percent: 33.3 },
      phone_clicks: { previous: 1, change: 2, percent: 200 },
    },
    ctr: { previous: 20, change: 5 },
    avgPosition: { previous: 5, change: -0.5 },
  },
};

test("gateOwnedBusinessStats returns full access for featured listings", () => {
  const result = gateOwnedBusinessStats(fullStats, true);
  assert.equal(result.analyticsAccess, "full");
  assert.equal(result.totals.phone_clicks, 3);
  assert.equal(result.ctr, 25);
  assert.deepEqual(result.impressionsBySource, { search: 20 });
  assert.equal(result.daily[0].listing_clicks, 2);
});

test("gateOwnedBusinessStats strips gated metrics for basic access", () => {
  const result = gateOwnedBusinessStats(fullStats, false);
  assert.equal(result.analyticsAccess, "basic");
  assert.deepEqual(result.totals, {
    page_views: 10,
    impressions: 20,
  });
  assert.equal(result.ctr, null);
  assert.equal(result.avgPosition, null);
  assert.deepEqual(result.impressionsBySource, { search: 20 });
  assert.equal(result.clicksBySource, null);
  assert.equal(result.ctrBySource, null);
  assert.equal(result.avgPositionBySource, null);
  assert.equal(result.daily[0].listing_clicks, 0);
  assert.equal(result.comparison.totals.phone_clicks, undefined);
  assert.equal(result.comparison.totals.listing_clicks, undefined);
  assert.equal(result.comparison.totals.page_views.change, 2);
  assert.equal(result.comparison.totals.impressions.change, 5);
  assert.equal(result.comparison.ctr, null);
});
