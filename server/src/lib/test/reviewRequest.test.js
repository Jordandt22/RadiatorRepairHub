import test from "node:test";
import assert from "node:assert/strict";
import {
  FEATURED_REVIEW_EMAIL_MONTHLY_LIMIT,
  applyReviewMessageTemplate,
  buildReviewEmailHtml,
  defaultReviewMessageTemplate,
  reviewMessageToTemplate,
  formatReviewFromAddress,
  googleReviewUrl,
  isCustomerReviewSendBlocked,
  isReviewSendBlocked,
  nextZonedMonthStart,
  reviewEmailUsage,
  zonedMonthStart,
} from "../reviewRequest.js";

test("google review url uses the place id", () => {
  assert.equal(
    googleReviewUrl("ChIJ abc"),
    "https://search.google.com/local/writereview?placeid=ChIJ%20abc"
  );
  assert.equal(googleReviewUrl("  "), null);
});

test("review from address uses the shop name and the RadiatorRepairHub mailbox", () => {
  assert.equal(
    formatReviewFromAddress("Jeff Haas Mazda", "team@radiatorrepairhub.com"),
    '"Jeff Haas Mazda" <team@radiatorrepairhub.com>'
  );
  assert.equal(
    formatReviewFromAddress('Joe\'s "Radiator"', "team@radiatorrepairhub.com"),
    '"Joe\'s \\"Radiator\\"" <team@radiatorrepairhub.com>'
  );
});

test("a saved review note keeps the customer name as a token", () => {
  const template = defaultReviewMessageTemplate("Jeff Haas Mazda");
  assert.equal(
    applyReviewMessageTemplate(template, "Jane"),
    "Hi Jane, thank you for coming into Jeff Haas Mazda, we hope you had a great experience! If you have a moment, we'd love if you could leave a review. Takes less than a minute and it means the world for our local shop!"
  );
  assert.equal(
    applyReviewMessageTemplate(template, ""),
    "Hi, thank you for coming into Jeff Haas Mazda, we hope you had a great experience! If you have a moment, we'd love if you could leave a review. Takes less than a minute and it means the world for our local shop!"
  );
  assert.equal(
    reviewMessageToTemplate(
      "Hi Jane, thanks for visiting Jeff Haas Mazda.",
      "Jane"
    ),
    "Hi {name}, thanks for visiting Jeff Haas Mazda."
  );
});

test("review email html keeps a rewritten message and always includes the link", () => {
  const reviewUrl =
    "https://search.google.com/local/writereview?placeid=ChIJabc";
  const unsubscribeUrl = "https://radiatorrepairhub.com/email/unsubscribe?token=abc.def";
  const html = buildReviewEmailHtml({
    message: "Thanks for coming in.\nAsk for Alex.",
    reviewUrl,
    shopTitle: "Jeff Haas Mazda",
    unsubscribeUrl,
  });
  assert.match(html, /Thanks for coming in\./);
  assert.match(html, /Ask for Alex\./);
  assert.match(html, new RegExp(reviewUrl.replaceAll("?", "\\?")));
  assert.match(html, /Sent by RadiatorRepairHub on behalf of Jeff Haas Mazda\./);
  assert.match(html, /You can unsubscribe from review emails for Jeff Haas Mazda\./);
  assert.match(html, /href="https:\/\/radiatorrepairhub.com\/email\/unsubscribe\?token=abc\.def"/);
  assert.doesNotMatch(html, /<script/i);
});

test("featured shops stop at 20 sent review emails and partners do not", () => {
  const featured = reviewEmailUsage({
    isPartner: false,
    sentThisMonth: FEATURED_REVIEW_EMAIL_MONTHLY_LIMIT,
  });
  assert.equal(featured.limit, 20);
  assert.equal(featured.unlimited, false);
  assert.equal(isReviewSendBlocked(featured), true);

  const partner = reviewEmailUsage({
    isPartner: true,
    sentThisMonth: 80,
  });
  assert.equal(partner.limit, null);
  assert.equal(partner.unlimited, true);
  assert.equal(isReviewSendBlocked(partner), false);
});

test("a customer can receive two review emails in a month", () => {
  assert.equal(isCustomerReviewSendBlocked(0), false);
  assert.equal(isCustomerReviewSendBlocked(1), false);
  assert.equal(isCustomerReviewSendBlocked(2), true);
});

test("month boundaries follow the shop timezone", () => {
  const march = new Date("2026-03-14T18:00:00.000Z");
  assert.equal(
    zonedMonthStart("America/Los_Angeles", march).toISOString(),
    "2026-03-01T08:00:00.000Z"
  );
  assert.equal(
    nextZonedMonthStart("America/Los_Angeles", march).toISOString(),
    "2026-04-01T07:00:00.000Z"
  );

  const april = new Date("2026-04-15T12:00:00.000Z");
  assert.equal(
    zonedMonthStart("America/Los_Angeles", april).toISOString(),
    "2026-04-01T07:00:00.000Z"
  );
});
