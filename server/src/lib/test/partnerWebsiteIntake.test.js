import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyListingPrefill,
  isPartnerIntakePriorityActive,
  mapPartnerWebsiteIntake,
  normalizeStep1,
  normalizeStep2,
  normalizeStep3,
  normalizeStep4,
  validateReadyToSubmit,
} from "../partnerWebsiteIntake.js";

function sampleHours() {
  return [
    {
      day_of_week: "Monday",
      is_closed: false,
      hours: [{ open: "09:00", close: "17:00" }],
    },
    { day_of_week: "Tuesday", is_closed: true, hours: [] },
    { day_of_week: "Wednesday", is_closed: true, hours: [] },
    { day_of_week: "Thursday", is_closed: true, hours: [] },
    { day_of_week: "Friday", is_closed: true, hours: [] },
    { day_of_week: "Saturday", is_closed: true, hours: [] },
    { day_of_week: "Sunday", is_closed: true, hours: [] },
  ];
}

describe("normalizeStep1", () => {
  it("requires core confirm fields", () => {
    const { errors } = normalizeStep1({});
    assert.equal(errors.name, "Enter the business name.");
    assert.ok(errors.googleMapsUrl);
  });

  it("copies public contact when sameAsPublic", () => {
    const { payload, errors } = normalizeStep1({
      name: "Iron Bay",
      googleMapsUrl: "https://maps.google.com/?q=test",
      publicEmail: "Shop@Example.com",
      publicPhone: "555-0100",
      sameAsPublic: true,
      hours: sampleHours(),
      walkIns: true,
      appointments: true,
    });
    assert.deepEqual(errors, {});
    assert.equal(payload.preferredEmail, "shop@example.com");
    assert.equal(payload.preferredPhone, "555-0100");
    assert.equal(payload.hours[0].day_of_week, "Monday");
  });

  it("rejects overlapping periods", () => {
    const hours = sampleHours();
    hours[0].hours = [
      { open: "09:00", close: "14:00" },
      { open: "13:00", close: "17:00" },
    ];
    const { errors } = normalizeStep1({
      name: "Iron Bay",
      googleMapsUrl: "https://maps.google.com/?q=test",
      publicPhone: "555-0100",
      hours,
      walkIns: true,
      appointments: true,
    });
    assert.ok(errors["hours.Monday"]);
  });
});

describe("normalizeStep2", () => {
  it("requires gallery when requireMedia but not logo", () => {
    const { errors } = normalizeStep2(
      {
        preferredDomain: "ironbayradiator.com",
        description: "Radiator shop",
        yearsOfService: "20",
      },
      { requireMedia: true }
    );
    assert.equal(errors.logo, undefined);
    assert.ok(errors.images);
  });
});

describe("normalizeStep3", () => {
  it("requires at least four named services", () => {
    const { errors } = normalizeStep3({
      services: [
        { name: "A", description: "" },
        { name: "B", description: "" },
        { name: "", description: "" },
        { name: "", description: "" },
      ],
    });
    assert.ok(errors.services);
  });
});

describe("normalizeStep4", () => {
  it("defaults theme to dark and checks accent color", () => {
    const ok = normalizeStep4({ theme: "light", accentColor: "#E31B16" });
    assert.deepEqual(ok.errors, {});
    assert.equal(ok.payload.theme, "light");

    const bad = normalizeStep4({ accentColor: "red" });
    assert.equal(bad.errors.accentColor, "Use a hex color like #E31B16.");
  });
});

describe("applyListingPrefill", () => {
  it("fills empty fields from listing only", () => {
    const payload = applyListingPrefill(
      { name: "Saved Name" },
      {
        title: "Listing Title",
        email: "list@example.com",
        phone: "555",
        googleMapsUrl: "https://maps.example.com",
        hoursDays: sampleHours(),
      }
    );
    assert.equal(payload.name, "Saved Name");
    assert.equal(payload.publicEmail, "list@example.com");
    assert.equal(payload.hours[0].is_closed, false);
    assert.equal(payload.hours[0].hours[0].open, "09:00");
  });
});

describe("validateReadyToSubmit", () => {
  it("accepts a complete payload", () => {
    const images = Array.from({ length: 4 }, (_, i) => ({
      imageId: `00000000-0000-4000-8000-00000000000${i}`,
      url: `https://images.example.com/${i}`,
    }));
    const { errors } = validateReadyToSubmit({
      name: "Iron Bay",
      googleMapsUrl: "https://maps.google.com/?q=test",
      publicEmail: "shop@example.com",
      publicPhone: "555-0100",
      sameAsPublic: true,
      hours: sampleHours(),
      walkIns: true,
      appointments: false,
      preferredDomain: "ironbayradiator.com",
      logo: {
        imageId: "00000000-0000-4000-8000-000000000099",
        url: "https://images.example.com/logo",
      },
      images,
      description: "We fix radiators.",
      yearsOfService: "12",
      services: [
        { name: "Repair", description: "Core repair" },
        { name: "Flush", description: "" },
        { name: "AC", description: "" },
        { name: "Heater", description: "" },
      ],
      newCustomerProcess: [{ text: "Call us." }],
      theme: "dark",
    });
    assert.deepEqual(errors, {});
  });
});

describe("mapPartnerWebsiteIntake", () => {
  it("defaults to needs_info", () => {
    assert.equal(mapPartnerWebsiteIntake(null).status, "needs_info");
  });

  it("maps submitted rows and priority", () => {
    const mapped = mapPartnerWebsiteIntake({
      status: "submitted",
      payload: { name: "Hi" },
      current_step: 3,
      started_at: "2026-10-20T00:00:00.000Z",
      priority_until: "2026-10-27T00:00:00.000Z",
      submitted_at: "2026-10-27T00:00:00.000Z",
      updated_at: "2026-10-27T00:00:00.000Z",
    });
    assert.equal(mapped.status, "submitted");
    assert.equal(mapped.payload.name, "Hi");
    assert.equal(mapped.priorityActive, false);
  });
});

describe("isPartnerIntakePriorityActive", () => {
  it("is active before priority_until when needs_info", () => {
    const until = new Date(Date.now() + 86_400_000).toISOString();
    assert.equal(isPartnerIntakePriorityActive(until, "needs_info"), true);
    assert.equal(isPartnerIntakePriorityActive(until, "submitted"), false);
  });
});
