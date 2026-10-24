import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCustomerLeadEmailHtml,
  buildOwnerLeadEmailHtml,
  formatLeadSubmittedAt,
  formatShopAddress,
  formatShopHours,
  partnerSiteUrl,
  publicReplyEmail,
} from "../templateLeadEmail.js";

const submittedAt = new Date("2026-10-24T05:35:00.000Z");

const site = {
  shopName: "Iron Bay Radiator & Cooling",
  domain: "ironbayradiator.com",
  timezone: "America/Los_Angeles",
  dashboardUrl:
    "http://localhost:3000/dashboard?tab=automation&section=lead&business=11111111-1111-4111-8111-111111111111",
  phone: "(562) 555-0198",
  address: "123 Harbor Ave",
  cityName: "Long Beach",
  stateCode: "CA",
  postalCode: "90802",
  publicEmail: "service@ironbayradiator.example",
  hours: [
    { day_of_week: "Monday", is_closed: false, hours_text: "7:30 AM to 5:30 PM" },
    { day_of_week: "Saturday", is_closed: true, hours_text: "Closed" },
  ],
};

const lead = {
  name: "Jane <Rivera>",
  phone: "(562) 555-0142",
  email: "jane@example.com",
  service: "Radiator repair",
  vehicle: "2014 Ford F-150",
  issue: "Overheating\non the freeway",
};

test("owner email leads with the request and thanks the partner last", () => {
  const html = buildOwnerLeadEmailHtml(site, lead, submittedAt);
  assert.match(html, /^<p>New lead submitted from the Iron Bay Radiator &amp; Cooling website\.<\/p>/);
  assert.match(html, /Submitted:<\/strong> Oct 23, 2026, 10:35 PM PDT/);
  assert.match(html, /tel:5625550142/);
  assert.match(html, /mailto:jane@example.com/);
  assert.match(html, /Jane &lt;Rivera&gt;/);
  assert.match(html, /Overheating<br>on the freeway/);
  assert.match(
    html,
    /Sent from <a href="https:\/\/ironbayradiator.com"/
  );
  assert.match(html, /Open this lead in your dashboard/);
  assert.match(html, /section=lead/);
  assert.ok(
    html.lastIndexOf("Thanks for partnering with RadiatorRepairHub.") >
      html.indexOf("Issue:")
  );
  assert.doesNotMatch(html, /unsubscribe/i);
});

test("owner email says the visitor email was not provided", () => {
  const html = buildOwnerLeadEmailHtml(
    site,
    { ...lead, email: "" },
    submittedAt
  );
  assert.match(html, /Email:<\/strong> Not provided/);
  assert.doesNotMatch(html, /mailto:/);
});

test("customer email repeats the job and lists public shop contact", () => {
  const html = buildCustomerLeadEmailHtml(site, lead);
  assert.match(html, /^<p>Hi Jane &lt;Rivera&gt;,<\/p>/);
  assert.match(
    html,
    /your request for Radiator repair on your 2014 Ford F-150/
  );
  assert.match(html, /Call the shop if you need them sooner\./);
  assert.match(html, /tel:5625550198/);
  assert.match(html, /123 Harbor Ave<br>Long Beach, CA 90802/);
  assert.match(html, /Monday: 7:30 AM to 5:30 PM<br>Tuesday: Closed/);
  assert.match(html, /Sunday: Closed/);
  assert.match(html, /mailto:service@ironbayradiator.example/);
  assert.match(html, /href="https:\/\/ironbayradiator.com"/);
  assert.doesNotMatch(html, /notification@/);
  assert.ok(
    html.endsWith(
      "Iron Bay Radiator &amp; Cooling is partnered with <a href=\"https://radiatorrepairhub.com\" style=\"color: #1a73e8;\">RadiatorRepairHub</a>.</p>"
    )
  );
});

test("customer email omits hours when the listing has none", () => {
  const html = buildCustomerLeadEmailHtml({ ...site, hours: [] }, lead);
  assert.doesNotMatch(html, /Hours:/);
});

test("hours text is built from open and close times when no label is stored", () => {
  assert.equal(
    formatShopHours([
      {
        day_of_week: "Friday",
        is_closed: false,
        hours: [{ open: "08:00", close: "17:00" }],
      },
    ]).split("\n")[4],
    "Friday: 8 AM to 5 PM"
  );
});

test("customer email skips the call line when the shop has no phone", () => {
  const html = buildCustomerLeadEmailHtml({ ...site, phone: "" }, lead);
  assert.doesNotMatch(html, /Call the shop if you need them sooner/);
  assert.match(html, /123 Harbor Ave/);
});

test("address stays a single line when the street already names the city", () => {
  assert.equal(
    formatShopAddress({
      address: "123 Harbor Ave, Long Beach, CA 90802",
      cityName: "Long Beach",
      stateCode: "CA",
      postalCode: "90802",
    }),
    "123 Harbor Ave, Long Beach, CA 90802"
  );
});

test("partner site url uses the bare host", () => {
  assert.equal(partnerSiteUrl("https://www.ironbayradiator.com/contact"), "https://ironbayradiator.com");
  assert.equal(partnerSiteUrl("localhost"), null);
});

test("public reply address rejects a blank or unsafe value", () => {
  assert.equal(publicReplyEmail("  service@ironbayradiator.example "), "service@ironbayradiator.example");
  assert.equal(publicReplyEmail(""), null);
  assert.equal(publicReplyEmail("not an email"), null);
});

test("submitted time falls back when the shop timezone is invalid", () => {
  const stamp = formatLeadSubmittedAt(submittedAt, "Not/AZone");
  assert.match(stamp, /Oct 23, 2026, 10:35 PM PDT/);
});
