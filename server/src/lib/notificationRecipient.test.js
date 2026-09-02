import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeNotificationEmail,
  resolveNotificationRecipient,
  resolveNotificationRecipientSource,
} from "./notificationRecipient.js";

test("normalizeNotificationEmail trims and lowercases", () => {
  assert.equal(normalizeNotificationEmail("  Owner@Shop.com  "), "owner@shop.com");
  assert.equal(normalizeNotificationEmail(""), null);
  assert.equal(normalizeNotificationEmail(null), null);
});

test("unclaimed listings use listing email only", () => {
  const business = {
    is_claimed: false,
    email: "shop@example.com",
    notification_email: "manager@example.com",
    owner_email: "owner@example.com",
  };
  assert.equal(resolveNotificationRecipient(business), "shop@example.com");
  assert.deepEqual(resolveNotificationRecipientSource(business), {
    email: "shop@example.com",
    source: "listing_email",
  });
});

test("claimed listings prefer notification email then account then listing", () => {
  const business = {
    is_claimed: true,
    email: "shop@example.com",
    notification_email: "manager@example.com",
    owner_email: "owner@example.com",
  };
  assert.equal(resolveNotificationRecipient(business), "manager@example.com");
  assert.equal(
    resolveNotificationRecipient(
      { ...business, notification_email: null },
      "login@example.com"
    ),
    "login@example.com"
  );
  assert.equal(
    resolveNotificationRecipient({
      ...business,
      notification_email: null,
      owner_email: null,
    }),
    "shop@example.com"
  );
});
