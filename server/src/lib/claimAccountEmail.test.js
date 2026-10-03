import test from "node:test";
import assert from "node:assert/strict";
import {
  isVerifiedListingAccountEmail,
  resolveClaimAccountEmail,
} from "./claimAccountEmail.js";

test("unsigned email claims default to the listing email", () => {
  assert.equal(
    resolveClaimAccountEmail({
      listingEmail: "Shop@Example.com",
    }),
    "shop@example.com"
  );
});

test("unsigned email claims can choose a different account email", () => {
  assert.equal(
    resolveClaimAccountEmail({
      submittedEmail: " Owner@Gmail.com ",
      listingEmail: "shop@example.com",
    }),
    "owner@gmail.com"
  );
});

test("signed-in claims keep the account email", () => {
  assert.equal(
    resolveClaimAccountEmail({
      submittedEmail: "other@example.com",
      authenticatedEmail: "Owner@Gmail.com",
      listingEmail: "shop@example.com",
    }),
    "owner@gmail.com"
  );
});

test("unsigned phone claims use only the submitted email", () => {
  assert.equal(
    resolveClaimAccountEmail({
      isPhoneClaim: true,
      listingEmail: "shop@example.com",
    }),
    ""
  );
  assert.equal(
    resolveClaimAccountEmail({
      isPhoneClaim: true,
      submittedEmail: "owner@gmail.com",
      listingEmail: "shop@example.com",
    }),
    "owner@gmail.com"
  );
});

test("only a matching email-claim inbox counts as verified", () => {
  assert.equal(
    isVerifiedListingAccountEmail({
      accountEmail: "Shop@Example.com",
      listingEmail: "shop@example.com",
    }),
    true
  );
  assert.equal(
    isVerifiedListingAccountEmail({
      accountEmail: "owner@gmail.com",
      listingEmail: "shop@example.com",
    }),
    false
  );
  assert.equal(
    isVerifiedListingAccountEmail({
      isPhoneClaim: true,
      accountEmail: "shop@example.com",
      listingEmail: "shop@example.com",
    }),
    false
  );
});
