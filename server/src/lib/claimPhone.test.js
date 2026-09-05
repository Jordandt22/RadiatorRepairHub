import test from "node:test";
import assert from "node:assert/strict";
import {
  CLAIM_PHONE_BLOCK_REASONS,
  formatClaimPhoneDisplay,
  getLocalClaimPhoneBlockReason,
  getPhoneClaimEligibility,
  isBlockedClaimPhone,
  maskClaimPhone,
  normalizeClaimPhone,
  resolveClaimCallTarget,
} from "./claimPhone.js";

const OPEN_ALL_DAY = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((day) => ({
  day_of_week: day,
  is_closed: false,
  hours: [{ open: "00:00", close: "23:45" }],
}));

test("normalizeClaimPhone accepts common listing formats", () => {
  assert.equal(normalizeClaimPhone("(559) 523-4567"), "+15595234567");
  assert.equal(normalizeClaimPhone("559-523-4567"), "+15595234567");
  assert.equal(normalizeClaimPhone("+1 559 523 4567"), "+15595234567");
  assert.equal(normalizeClaimPhone("15595234567"), "+15595234567");
});

test("normalizeClaimPhone rejects non-dialable numbers", () => {
  assert.equal(normalizeClaimPhone(""), null);
  assert.equal(normalizeClaimPhone(null), null);
  assert.equal(normalizeClaimPhone("123"), null);
  assert.equal(normalizeClaimPhone("055-523-4567"), null); // area code starts with 0
  assert.equal(normalizeClaimPhone("559-023-4567"), null); // exchange starts with 0
  assert.equal(normalizeClaimPhone("559-123-4567"), null); // exchange starts with 1
  assert.equal(normalizeClaimPhone("+44 20 7523 4567"), null);
});

test("isBlockedClaimPhone blocks toll-free and premium area codes", () => {
  assert.equal(isBlockedClaimPhone("+18005234567"), true);
  assert.equal(isBlockedClaimPhone("+18885234567"), true);
  assert.equal(isBlockedClaimPhone("+19005234567"), true);
  assert.equal(isBlockedClaimPhone("+15595234567"), false);
});

test("getLocalClaimPhoneBlockReason reports the specific problem", () => {
  assert.equal(
    getLocalClaimPhoneBlockReason(""),
    CLAIM_PHONE_BLOCK_REASONS.NO_PHONE
  );
  assert.equal(
    getLocalClaimPhoneBlockReason("555"),
    CLAIM_PHONE_BLOCK_REASONS.INVALID_PHONE
  );
  assert.equal(
    getLocalClaimPhoneBlockReason("(800) 523-4567"),
    CLAIM_PHONE_BLOCK_REASONS.FILTERED_PHONE
  );
  assert.equal(getLocalClaimPhoneBlockReason("(559) 523-4567"), null);
});

test("display and masked formats", () => {
  assert.equal(formatClaimPhoneDisplay("+15595234567"), "(559) 523-4567");
  assert.equal(maskClaimPhone("+15595234567"), "(559) ***-4567");
  assert.equal(maskClaimPhone("bad"), null);
});

test("getPhoneClaimEligibility requires a timezone", (t) => {
  const originalEnv = process.env.NODE_ENV;
  t.after(() => {
    process.env.NODE_ENV = originalEnv;
  });
  process.env.NODE_ENV = "production";

  const result = getPhoneClaimEligibility({
    phone: "(559) 523-4567",
    hours: OPEN_ALL_DAY,
    timezone: null,
  });

  assert.equal(result.eligible, false);
  assert.equal(result.reason, CLAIM_PHONE_BLOCK_REASONS.NO_TIMEZONE);
});

test("getPhoneClaimEligibility blocks shared phones before checking hours", () => {
  const result = getPhoneClaimEligibility({
    phone: "(559) 523-4567",
    hours: OPEN_ALL_DAY,
    timezone: "America/Los_Angeles",
    isPhoneShared: true,
  });

  assert.equal(result.eligible, false);
  assert.equal(result.reason, CLAIM_PHONE_BLOCK_REASONS.SHARED_PHONE);
  assert.equal(result.phoneE164, "+15595234567");
});

test("getPhoneClaimEligibility blocks closed days", (t) => {
  const originalEnv = process.env.NODE_ENV;
  t.after(() => {
    process.env.NODE_ENV = originalEnv;
  });
  process.env.NODE_ENV = "production";

  const closed = OPEN_ALL_DAY.map((day) => ({
    ...day,
    is_closed: true,
    hours: [],
  }));

  const result = getPhoneClaimEligibility({
    phone: "(559) 523-4567",
    hours: closed,
    timezone: "America/Los_Angeles",
  });

  assert.equal(result.eligible, false);
  assert.equal(result.reason, CLAIM_PHONE_BLOCK_REASONS.OUTSIDE_HOURS);
});

test("getPhoneClaimEligibility skips hour checks in development", (t) => {
  const originalEnv = process.env.NODE_ENV;
  t.after(() => {
    process.env.NODE_ENV = originalEnv;
  });
  process.env.NODE_ENV = "development";

  const closed = OPEN_ALL_DAY.map((day) => ({
    ...day,
    is_closed: true,
    hours: [],
  }));

  const result = getPhoneClaimEligibility({
    phone: "(559) 523-4567",
    hours: closed,
    timezone: null,
  });

  assert.equal(result.eligible, true);
  assert.equal(result.reason, null);
  assert.equal(result.phoneE164, "+15595234567");
});

test("resolveClaimCallTarget uses the test phone in development", (t) => {
  const originalEnv = process.env.NODE_ENV;
  const originalTestPhone = process.env.TEST_RECIPIENT_PHONE;
  t.after(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalTestPhone === undefined) delete process.env.TEST_RECIPIENT_PHONE;
    else process.env.TEST_RECIPIENT_PHONE = originalTestPhone;
  });

  process.env.NODE_ENV = "production";
  assert.equal(resolveClaimCallTarget("+15595234567"), "+15595234567");

  process.env.NODE_ENV = "development";
  process.env.TEST_RECIPIENT_PHONE = "(209) 555-0199";
  assert.equal(resolveClaimCallTarget("+15595234567"), "+12095550199");

  delete process.env.TEST_RECIPIENT_PHONE;
  assert.equal(resolveClaimCallTarget("+15595234567"), null);
});
