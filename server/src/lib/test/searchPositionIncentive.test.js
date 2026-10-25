import test from "node:test";
import assert from "node:assert/strict";
import {
  formatSearchPositionIncentiveCopy,
  formatSearchPositionOrdinal,
  qualifySearchPositionIncentive,
} from "../searchPositionIncentive.js";

test("qualifySearchPositionIncentive hides thin or first-page averages", () => {
  assert.equal(qualifySearchPositionIncentive(0, 0), null);
  assert.equal(qualifySearchPositionIncentive(9, 180), null);
  assert.equal(qualifySearchPositionIncentive(10, 124), null);
  assert.deepEqual(qualifySearchPositionIncentive(10, 125), {
    avgPosition: 12.5,
    impressions: 10,
  });
  assert.deepEqual(qualifySearchPositionIncentive(10, 180), {
    avgPosition: 18,
    impressions: 10,
  });
});

test("formatSearchPositionOrdinal uses English ordinals", () => {
  assert.equal(formatSearchPositionOrdinal(1), "1st");
  assert.equal(formatSearchPositionOrdinal(2), "2nd");
  assert.equal(formatSearchPositionOrdinal(3), "3rd");
  assert.equal(formatSearchPositionOrdinal(11), "11th");
  assert.equal(formatSearchPositionOrdinal(12), "12th");
  assert.equal(formatSearchPositionOrdinal(13), "13th");
  assert.equal(formatSearchPositionOrdinal(21), "21st");
  assert.equal(formatSearchPositionOrdinal(22), "22nd");
  assert.equal(formatSearchPositionOrdinal(23), "23rd");
  assert.equal(formatSearchPositionOrdinal(18.4), "18th");
});

test("formatSearchPositionIncentiveCopy describes a past-first-page position", () => {
  assert.equal(
    formatSearchPositionIncentiveCopy({ avgPosition: 17.6, impressions: 20 }),
    "Shoppers are finding you around 18th in search, past the first page. Claimed listings are shown ahead of unclaimed ones, so claiming yours moves you up."
  );
  assert.equal(formatSearchPositionIncentiveCopy(null), null);
});
