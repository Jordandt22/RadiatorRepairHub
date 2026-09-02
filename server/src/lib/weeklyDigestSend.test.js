import test from "node:test";
import assert from "node:assert/strict";
import { DIGEST_TIERS } from "./weeklyDigestStats.js";
import {
  buildWeeklyDigestEmailPayload,
  buildWeeklyDigestStatsHtml,
} from "./weeklyDigestSend.js";

test("unclaimed digest HTML uses sections and a soft phone-button note", () => {
  const html = buildWeeklyDigestStatsHtml({
    tier: DIGEST_TIERS.UNCLAIMED,
    hasCallButtonInterest: true,
    totals: { impressions: 20, page_views: 10, phone_clicks: 3 },
  });
  assert.match(html, /Visibility/);
  assert.match(html, /Listing appearances/);
  assert.match(html, /How often your shop showed up in directory results/);
  assert.match(html, /Customer interest/);
  assert.match(html, /Some people clicked your phone button this week\./);
  assert.doesNotMatch(html, /Phone clicks/);
  assert.doesNotMatch(html, /Click-through rate/);
});

test("claimed basic digest HTML keeps the soft phone-button note and sources", () => {
  const html = buildWeeklyDigestStatsHtml({
    tier: DIGEST_TIERS.CLAIMED_BASIC,
    hasCallButtonInterest: true,
    totals: { impressions: 20, page_views: 10 },
    impressionsBySource: { search: 12, city: 8 },
  });
  assert.match(html, /Page views/);
  assert.match(html, /How many times someone opened your business page/);
  assert.match(html, /Some people clicked your phone button this week\./);
  assert.match(html, /Where people saw you/);
  assert.match(html, /Search results/);
  assert.doesNotMatch(html, /Phone clicks/);
});

test("featured digest HTML keeps exact phone click counts with explanations", () => {
  const html = buildWeeklyDigestStatsHtml({
    tier: DIGEST_TIERS.FEATURED,
    hasCallButtonInterest: true,
    totals: {
      impressions: 20,
      page_views: 10,
      listing_clicks: 5,
      phone_clicks: 3,
      directions_clicks: 2,
      website_clicks: 1,
      email_clicks: 0,
    },
    ctr: 25,
    avgPosition: 4.2,
  });
  assert.match(html, /Discovery performance/);
  assert.match(html, /Contact actions/);
  assert.match(html, /Listing clicks/);
  assert.match(
    html,
    /How many times someone clicked your listing card to open the full page/
  );
  assert.match(html, /Phone clicks/);
  assert.match(html, />3</);
  assert.doesNotMatch(
    html,
    /Some people clicked your phone button this week\./
  );
});

test("soft phone-button note is omitted when there were no clicks", () => {
  const html = buildWeeklyDigestStatsHtml({
    tier: DIGEST_TIERS.UNCLAIMED,
    hasCallButtonInterest: false,
    totals: { impressions: 20, page_views: 10, phone_clicks: 0 },
  });
  assert.doesNotMatch(
    html,
    /Some people clicked your phone button this week\./
  );
  assert.doesNotMatch(html, /Customer interest/);
});

test("digest payload includes styled shell and RFC 8058 unsubscribe headers", () => {
  process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-unsubscribe-secret";
  const payload = buildWeeklyDigestEmailPayload({
    business: {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Acme Radiator",
      slug: "acme-radiator",
    },
    digestStats: {
      tier: DIGEST_TIERS.UNCLAIMED,
      hasCallButtonInterest: true,
      totals: { impressions: 4, page_views: 2, phone_clicks: 1 },
    },
    recipient: "shop@example.com",
    senderEmail: "hello@radiatorrepairhub.com",
  });

  assert.equal(
    payload.headers["List-Unsubscribe-Post"],
    "List-Unsubscribe=One-Click"
  );
  assert.match(
    payload.headers["List-Unsubscribe"],
    /^<https?:\/\/.+\/api\/email\/unsubscribe\?token=/
  );
  assert.match(payload.html, /\/email\/unsubscribe\?token=/);
  assert.match(payload.html, /RadiatorRepairHub/);
  assert.match(payload.html, /Claim your listing free/);
  assert.match(payload.subject, /Acme Radiator/);
});
