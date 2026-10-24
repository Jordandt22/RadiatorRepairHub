import test from "node:test";
import assert from "node:assert/strict";
import {
  allowedOriginsForDomain,
  normalizePartnerDomain,
} from "../partnerSiteDomain.js";

test("normalize strips scheme, path, port, and www", () => {
  assert.equal(
    normalizePartnerDomain("https://www.IronBay.com/contact"),
    "ironbay.com"
  );
  assert.equal(
    normalizePartnerDomain("http://ironbay.com:3002"),
    "ironbay.com"
  );
  assert.equal(normalizePartnerDomain("ironbayradiator.com"), "ironbayradiator.com");
});

test("normalize rejects empty and invalid hosts", () => {
  assert.equal(normalizePartnerDomain(""), null);
  assert.equal(normalizePartnerDomain("   "), null);
  assert.equal(normalizePartnerDomain("not a domain"), null);
  assert.equal(normalizePartnerDomain("javascript:alert(1)"), null);
});

test("two-label hosts allow apex and www", () => {
  assert.deepEqual(allowedOriginsForDomain("ironbayradiator.com"), [
    "https://ironbayradiator.com",
    "https://www.ironbayradiator.com",
  ]);
  assert.deepEqual(allowedOriginsForDomain("www.ironbayradiator.com"), [
    "https://ironbayradiator.com",
    "https://www.ironbayradiator.com",
  ]);
});

test("a deeper host does not gain a www origin", () => {
  assert.deepEqual(allowedOriginsForDomain("shop.example.com"), [
    "https://shop.example.com",
  ]);
});
