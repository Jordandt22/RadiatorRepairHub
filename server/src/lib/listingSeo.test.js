import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildHighlights,
  buildTitleTag,
  buildMetaDescription,
  buildLocalNote,
  buildKeywords,
  buildDerivedListingSeo,
} from "./listingSeo.js";

describe("buildHighlights", () => {
  it("maps amenity flags and rating chips", () => {
    const highlights = buildHighlights({
      features: {
        wheelchair_accessible: true,
        credit_cards: true,
        mechanic: false,
      },
      total_score: 5,
      reviews_count: 120,
    });
    assert.deepEqual(highlights, [
      "Wheelchair Accessible",
      "Credit Cards Accepted",
      "Perfect 5-Star Rating",
      "120+ Customer Reviews",
    ]);
  });
});

describe("buildTitleTag", () => {
  it("includes name, category, and city within 60 characters", () => {
    const tag = buildTitleTag({
      title: "Acme Radiator",
      categoryName: "Radiator Repair",
      cityName: "Austin",
    });
    assert.equal(tag, "Acme Radiator | Radiator Repair in Austin");
    assert.ok(tag.length <= 60);
  });

  it("falls back to title when category or city is missing", () => {
    assert.equal(buildTitleTag({ title: "Acme Radiator" }), "Acme Radiator");
  });

  it("truncates on a word boundary", () => {
    const tag = buildTitleTag({
      title: "Super Long Radiator And Cooling Specialists",
      categoryName: "Radiator Repair Shop",
      cityName: "San Francisco",
    });
    assert.ok(tag.length <= 60);
    assert.equal(tag.includes(" "), true);
    assert.equal(tag.endsWith(" "), false);
  });
});

describe("buildMetaDescription", () => {
  it("uses owner description when present", () => {
    const meta = buildMetaDescription({
      description: "Family-owned radiator shop serving East Austin.",
      title: "Acme",
    });
    assert.equal(meta, "Family-owned radiator shop serving East Austin.");
  });

  it("drops an incomplete trailing sentence when truncating", () => {
    const meta = buildMetaDescription({
      description:
        "Located on Katy Freeway in Houston, this trusted Mazda dealership offers comprehensive automotive solutions with an impressive 4.6-star rating from over 3,600 customers. Beyond new and used vehicle sales, they provide professional car repair and maintenance services, convenient oil changes, and full-service car wash facilities.",
    });
    assert.ok(meta.length <= 150);
    assert.equal(meta.includes("Beyond new"), false);
    assert.equal(/\s(from|with|and|beyond)$/i.test(meta), false);
  });

  it("builds a location fallback under 150 characters", () => {
    const meta = buildMetaDescription({
      title: "Acme Radiator",
      categoryName: "Radiator Repair",
      cityName: "Austin",
      stateName: "Texas",
      total_score: 4.8,
      reviews_count: 40,
    });
    assert.match(meta, /Acme Radiator in Austin, Texas offers Radiator Repair/);
    assert.match(meta, /Rated 4\.8 from 40 reviews/);
    assert.ok(meta.length <= 150);
  });
});

describe("buildLocalNote", () => {
  it("takes the first sentences of description, limited to 25 words", () => {
    const note = buildLocalNote({
      description:
        "We fix radiators fast. Neighbors trust us. Extra sentence that should not appear.",
    });
    assert.equal(note, "We fix radiators fast. Neighbors trust us.");
  });

  it("does not keep a hanging fragment from the next sentence", () => {
    const note = buildLocalNote({
      description:
        "Located on Katy Freeway in Houston, this trusted Mazda dealership offers comprehensive automotive solutions with an impressive 4.6-star rating from over 3,600 customers. Beyond new and used vehicle sales, they provide professional car repair and maintenance services, convenient oil changes, and full-service car wash facilities.",
    });
    assert.equal(
      note,
      "Located on Katy Freeway in Houston, this trusted Mazda dealership offers comprehensive automotive solutions with an impressive 4.6-star rating from over 3,600 customers."
    );
  });

  it("falls back to a trusted-in-city line", () => {
    assert.equal(
      buildLocalNote({
        categoryName: "Radiator Repair",
        cityName: "Austin",
      }),
      "Trusted Radiator Repair in Austin."
    );
  });
});

describe("buildKeywords", () => {
  it("dedupes and includes defaults", () => {
    assert.deepEqual(
      buildKeywords({
        categoryName: "Radiator Repair",
        secondaryNames: ["Oil Change", "radiator repair"],
        cityName: "Austin",
      }),
      ["Radiator Repair", "Oil Change", "Austin", "auto repair"]
    );
  });
});

describe("buildDerivedListingSeo", () => {
  it("returns only requested fields", () => {
    const seo = buildDerivedListingSeo(
      {
        title: "Acme Radiator",
        description: "Family shop.",
        city: { name: "Austin" },
        state: { name: "Texas" },
        primary_category: { name: "Radiator Repair" },
        secondary_categories: [{ name: "Auto Repair" }],
        features: { credit_cards: true },
        total_score: 4.6,
        reviews_count: 12,
      },
      { fields: ["title_tag", "keywords"] }
    );
    assert.deepEqual(Object.keys(seo).sort(), ["keywords", "title_tag"]);
    assert.equal(seo.title_tag, "Acme Radiator | Radiator Repair in Austin");
    assert.ok(seo.keywords.includes("Austin"));
  });
});
