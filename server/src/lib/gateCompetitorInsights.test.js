import test from "node:test";
import assert from "node:assert/strict";
import { gateCompetitorInsights } from "./gateCompetitorInsights.js";

const insights = {
  available: true,
  minMarketSize: 3,
  city: { id: "city-1", name: "Dallas", slug: "dallas", stateCode: "TX" },
  market: {
    totalListings: 18,
    claimedListings: 6,
    featuredListings: 2,
    totalImpressions: 1000,
    totalListingClicks: 80,
    medianImpressions: 40,
    medianCtr: 6.5,
    medianAvgPosition: 5.2,
  },
  self: {
    id: "biz-1",
    impressions: 250,
    listingClicks: 20,
    ctr: 8,
    avgPosition: 3.1,
    impressionsRank: 2,
    clicksRank: 3,
  },
  competitors: [
    { id: "biz-2", title: "Shop B", impressions: 300, listingClicks: 25, ctr: 8.3 },
    { id: "biz-3", title: "Shop C", impressions: 120, listingClicks: 9, ctr: 7.5 },
  ],
};

test("gateCompetitorInsights returns full access for featured listings", () => {
  const result = gateCompetitorInsights(insights, true);
  assert.equal(result.insightsAccess, "full");
  assert.equal(result.competitors.length, 2);
  assert.equal(result.competitorCount, 2);
  assert.equal(result.market.medianCtr, 6.5);
  assert.equal(result.self.clicksRank, 3);
  assert.equal(result.self.impressionShare, 25);
});

test("gateCompetitorInsights strips peer data for basic access", () => {
  const result = gateCompetitorInsights(insights, false);
  assert.equal(result.insightsAccess, "basic");
  assert.deepEqual(result.competitors, []);
  assert.equal(result.competitorCount, 2);
  assert.deepEqual(result.market, {
    totalListings: 18,
    claimedListings: 6,
    featuredListings: 2,
  });
  assert.deepEqual(result.self, { impressionsRank: 2 });
});

test("gateCompetitorInsights passes through unavailable markets", () => {
  const unavailable = {
    available: false,
    reason: "small_market",
    minMarketSize: 3,
    market: { totalListings: 2 },
  };
  const result = gateCompetitorInsights(unavailable, false);
  assert.equal(result.available, false);
  assert.equal(result.reason, "small_market");
  assert.equal(result.insightsAccess, "basic");
  assert.deepEqual(result.competitors, []);
  assert.equal(result.self, null);
});
