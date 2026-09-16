import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isUsableBusinessSlug } from "./businessSlug.js";

describe("isUsableBusinessSlug", () => {
  it("accepts a normal listing slug", () => {
    assert.equal(isUsableBusinessSlug("acme-radiator"), true);
  });

  it("rejects missing and non-string values", () => {
    assert.equal(isUsableBusinessSlug(null), false);
    assert.equal(isUsableBusinessSlug(undefined), false);
    assert.equal(isUsableBusinessSlug(""), false);
    assert.equal(isUsableBusinessSlug("   "), false);
    assert.equal(isUsableBusinessSlug(123), false);
  });

  it("rejects JS stringified null/undefined path segments", () => {
    assert.equal(isUsableBusinessSlug("null"), false);
    assert.equal(isUsableBusinessSlug("undefined"), false);
    assert.equal(isUsableBusinessSlug("NULL"), false);
    assert.equal(isUsableBusinessSlug(" Undefined "), false);
  });
});
