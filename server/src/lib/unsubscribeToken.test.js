import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOneClickUnsubscribeUrl,
  buildUnsubscribeUrl,
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from "./unsubscribeToken.js";

test("signs and verifies an unsubscribe token", () => {
  process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-unsubscribe-secret";
  const token = signUnsubscribeToken({
    businessId: "11111111-1111-1111-1111-111111111111",
    email: "Shop@Example.com",
  });
  const verified = verifyUnsubscribeToken(token);
  assert.equal(verified.ok, true);
  assert.equal(verified.payload.email, "shop@example.com");
  assert.equal(
    verified.payload.businessId,
    "11111111-1111-1111-1111-111111111111"
  );
  assert.equal(verified.payload.type, "business_email");
});

test("still verifies legacy weekly_digest unsubscribe tokens", () => {
  process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-unsubscribe-secret";
  const token = signUnsubscribeToken({
    businessId: "11111111-1111-1111-1111-111111111111",
    email: "shop@example.com",
    type: "weekly_digest",
  });
  const verified = verifyUnsubscribeToken(token);
  assert.equal(verified.ok, true);
  assert.equal(verified.payload.type, "weekly_digest");
});

test("rejects tampered and expired tokens", () => {
  process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-unsubscribe-secret";
  const token = signUnsubscribeToken({
    businessId: "11111111-1111-1111-1111-111111111111",
    email: "shop@example.com",
  });
  assert.equal(verifyUnsubscribeToken(`${token}x`).ok, false);
  const expired = signUnsubscribeToken({
    businessId: "11111111-1111-1111-1111-111111111111",
    email: "shop@example.com",
    ttlSeconds: -10,
  });
  assert.equal(verifyUnsubscribeToken(expired).reason, "expired");
});

test("builds unsubscribe page and one-click URLs", () => {
  assert.equal(
    buildUnsubscribeUrl("abc.def", "https://radiatorrepairhub.com/"),
    "https://radiatorrepairhub.com/email/unsubscribe?token=abc.def"
  );
  assert.equal(
    buildOneClickUnsubscribeUrl("abc.def", "https://radiatorrepairhub.com/"),
    "https://radiatorrepairhub.com/api/email/unsubscribe?token=abc.def"
  );
});
