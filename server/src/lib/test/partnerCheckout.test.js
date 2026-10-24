import test from "node:test";
import assert from "node:assert/strict";
import {
  PARTNER_CHECKOUT_TTL_SECONDS,
  isPartnerCheckout,
  isPartnerClaimConflict,
  partnerCheckoutBlockReason,
  partnerCheckoutExpiresAt,
} from "../partnerCheckout.js";

test("partner checkout is detected from plan or price id", () => {
  assert.equal(
    isPartnerCheckout({
      plan: "partner",
      priceId: "price_featured",
      partnerPriceId: "price_partner",
    }),
    true
  );
  assert.equal(
    isPartnerCheckout({
      plan: "featured",
      priceId: "price_partner",
      partnerPriceId: "price_partner",
    }),
    true
  );
  assert.equal(
    isPartnerCheckout({
      plan: undefined,
      priceId: "price_featured",
      partnerPriceId: "price_partner",
    }),
    false
  );
});

test("partner checkout link is refused for claimed listings and live subscriptions", () => {
  assert.equal(partnerCheckoutBlockReason(null, null), "not_found");
  assert.equal(
    partnerCheckoutBlockReason({ is_claimed: true }, null),
    "claimed"
  );
  assert.equal(
    partnerCheckoutBlockReason(
      { is_claimed: false },
      { status: "active" }
    ),
    "live_subscription"
  );
  assert.equal(
    partnerCheckoutBlockReason(
      { is_claimed: false },
      { status: "canceled" }
    ),
    null
  );
  assert.equal(
    partnerCheckoutBlockReason({ is_claimed: false }, null),
    null
  );
});

test("a paid checkout does not claim a listing owned by someone else", () => {
  assert.equal(
    isPartnerClaimConflict({
      business: { is_claimed: true, owner_uid: "owner-a" },
      ownerUid: "owner-b",
    }),
    true
  );
  assert.equal(
    isPartnerClaimConflict({
      business: { is_claimed: true, owner_uid: "owner-a" },
      ownerUid: "owner-a",
    }),
    false
  );
  assert.equal(
    isPartnerClaimConflict({
      business: { is_claimed: false, owner_uid: null },
      ownerUid: "owner-b",
    }),
    false
  );
});

test("partner checkout expiry stays inside Stripe's allowed window", () => {
  const now = Date.parse("2026-10-13T20:00:00.000Z");
  const expiresAt = partnerCheckoutExpiresAt(now);
  assert.equal(expiresAt, Math.floor(now / 1000) + PARTNER_CHECKOUT_TTL_SECONDS);
  assert.ok(PARTNER_CHECKOUT_TTL_SECONDS >= 30 * 60);
  assert.ok(PARTNER_CHECKOUT_TTL_SECONDS <= 24 * 60 * 60);
});
