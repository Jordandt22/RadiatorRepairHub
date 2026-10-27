import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapPartnerWebsiteIntake,
  normalizePartnerWebsiteIntakePayload,
} from "../partnerWebsiteIntake.js";

describe("normalizePartnerWebsiteIntakePayload", () => {
  it("requires at least one field", () => {
    const { errors } = normalizePartnerWebsiteIntakePayload({});
    assert.equal(errors.form, "Add at least one detail before submitting.");
  });

  it("accepts a valid payload", () => {
    const { payload, errors } = normalizePartnerWebsiteIntakePayload({
      preferredDomain: " ironbayradiator.com ",
      accentColor: "#E31B16",
      contactEmail: "Shop@Example.com",
    });
    assert.deepEqual(errors, {});
    assert.equal(payload.preferredDomain, "ironbayradiator.com");
    assert.equal(payload.contactEmail, "shop@example.com");
    assert.equal(payload.accentColor, "#E31B16");
  });

  it("rejects bad accent colors and emails", () => {
    const { errors } = normalizePartnerWebsiteIntakePayload({
      accentColor: "red",
      contactEmail: "not-an-email",
    });
    assert.equal(errors.accentColor, "Use a hex color like #E31B16.");
    assert.equal(errors.contactEmail, "Enter a valid email address.");
  });
});

describe("mapPartnerWebsiteIntake", () => {
  it("defaults to needs_info", () => {
    assert.equal(mapPartnerWebsiteIntake(null).status, "needs_info");
  });

  it("maps submitted rows", () => {
    const mapped = mapPartnerWebsiteIntake({
      status: "submitted",
      payload: { about: "Hi" },
      submitted_at: "2026-10-27T00:00:00.000Z",
      updated_at: "2026-10-27T00:00:00.000Z",
    });
    assert.equal(mapped.status, "submitted");
    assert.equal(mapped.payload.about, "Hi");
  });
});
