import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  findBlockedCategoryMatch,
  BLOCKED_EXACT_CATEGORIES,
} from "./filter.js";
import {
  isDeletePrimaryCategory,
  isSecondaryUnlinkCategory,
} from "./categoryBlocklist.js";

describe("findBlockedCategoryMatch", () => {
  it("blocks exact unrelated primary categories", () => {
    assert.equal(
      findBlockedCategoryMatch({ categoryName: "Restaurant" }),
      "Restaurant",
    );
    assert.equal(
      findBlockedCategoryMatch({ categoryName: "Plumber" }),
      "Plumber",
    );
    assert.equal(
      findBlockedCategoryMatch({ categoryName: "HVAC contractor" }),
      "HVAC contractor",
    );
  });

  it("does not reject listings for exact junk secondary alone", () => {
    assert.equal(
      findBlockedCategoryMatch({
        categoryName: "Auto radiator repair service",
        categories: ["Auto radiator repair service", "Insurance agency"],
      }),
      null,
    );
    assert.equal(
      findBlockedCategoryMatch({
        categoryName: "Auto repair shop",
        categories: ["Cafe"],
      }),
      null,
    );
  });

  it("does not block legitimate auto categories or radiator manufacturers", () => {
    assert.equal(
      findBlockedCategoryMatch({ categoryName: "Auto parts store" }),
      null,
    );
    assert.equal(
      findBlockedCategoryMatch({ categoryName: "Manufacturer" }),
      null,
    );
    assert.equal(
      findBlockedCategoryMatch({ categoryName: "Corporate office" }),
      null,
    );
    assert.equal(
      findBlockedCategoryMatch({
        categoryName: "Auto radiator repair service",
        categories: ["Auto repair shop"],
      }),
      null,
    );
  });

  it("still blocks HVAC / plumbing via substring list", () => {
    assert.equal(
      findBlockedCategoryMatch({ categoryName: "Boiler repair" }),
      "boiler",
    );
    assert.equal(
      findBlockedCategoryMatch({
        categoryName: "Auto repair shop",
        categories: ["Residential heating"],
      }),
      "residential heating",
    );
  });

  it("includes clear-removal categories and unlink helpers", () => {
    assert.ok(BLOCKED_EXACT_CATEGORIES.includes("Bar"));
    assert.ok(BLOCKED_EXACT_CATEGORIES.includes("Cafe"));
    assert.ok(isDeletePrimaryCategory("Remodeler"));
    assert.ok(isDeletePrimaryCategory("Agrochemicals supplier"));
    assert.ok(isDeletePrimaryCategory("Chauffeur service"));
    assert.ok(isDeletePrimaryCategory("Store"));
    assert.equal(isDeletePrimaryCategory("Manufacturer"), false);
    assert.equal(isDeletePrimaryCategory("Corporate office"), false);
    assert.ok(isSecondaryUnlinkCategory("Manufacturer"));
    assert.ok(isSecondaryUnlinkCategory("Chauffeur service"));
    assert.ok(isSecondaryUnlinkCategory("Agrochemicals supplier"));
  });
});
