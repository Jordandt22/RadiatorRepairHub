import test from "node:test";
import assert from "node:assert/strict";
import {
  getTemplateSite,
  isTemplateLeadHoneypotFilled,
  templateLeadDuplicateKey,
  templateLeadRateKey,
} from "../templateLeads.js";

test("demo site is a known shop and unknown ids are not", () => {
  const site = getTemplateSite("iron-bay-demo");
  assert.equal(site.shopName, "Iron Bay Radiator & Cooling");
  assert.equal(site.ownerEmail, undefined);
  assert.equal(getTemplateSite("missing-shop"), null);
  assert.equal(getTemplateSite(""), null);
});

test("honeypot is filled only when company has text", () => {
  assert.equal(isTemplateLeadHoneypotFilled(""), false);
  assert.equal(isTemplateLeadHoneypotFilled("   "), false);
  assert.equal(isTemplateLeadHoneypotFilled(undefined), false);
  assert.equal(isTemplateLeadHoneypotFilled("Acme LLC"), true);
});

test("duplicate key ignores email case and issue spacing", () => {
  const left = templateLeadDuplicateKey({
    siteId: "iron-bay-demo",
    email: "Jane@Example.com",
    phone: "5625550198",
    issue: "Overheating  on the freeway",
  });
  const right = templateLeadDuplicateKey({
    siteId: "iron-bay-demo",
    email: "jane@example.com",
    phone: "5625550198",
    issue: "overheating on the freeway",
  });
  assert.equal(left, right);
  assert.match(left, /^TEMPLATE_LEAD_DUP:[a-f0-9]{32}$/);
});

test("duplicate key uses the business id when a partner listing is set", () => {
  const bySite = templateLeadDuplicateKey({
    siteId: "iron-bay-demo",
    email: "jane@example.com",
    phone: "5625550198",
    issue: "Leak",
  });
  const byBusiness = templateLeadDuplicateKey({
    businessId: "11111111-1111-4111-8111-111111111111",
    email: "jane@example.com",
    phone: "5625550198",
    issue: "Leak",
  });
  assert.notEqual(bySite, byBusiness);
});

test("duplicate key uses the phone when no email is present", () => {
  const withEmail = templateLeadDuplicateKey({
    siteId: "iron-bay-demo",
    email: "jane@example.com",
    phone: "5625550198",
    issue: "Leak",
  });
  const phoneOnly = templateLeadDuplicateKey({
    siteId: "iron-bay-demo",
    email: "",
    phone: "(562) 555-0198",
    issue: "Leak",
  });
  assert.notEqual(withEmail, phoneOnly);
});

test("rate key strips the ipv4-mapped prefix", () => {
  assert.equal(
    templateLeadRateKey("::ffff:127.0.0.1"),
    "TEMPLATE_LEAD_RATE:127.0.0.1"
  );
});
