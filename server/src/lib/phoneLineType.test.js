import test from "node:test";
import assert from "node:assert/strict";
import {
  groupBusinessesByClaimPhone,
  isTwilioRateLimitError,
  lookupRateLimitDelayMs,
  nextAllowedAtAfterLookup,
  nextLineTypeLookupStep,
  paceWaitMs,
  PHONE_LINE_TYPE_MIN_INTERVAL_MS,
  publicPhoneLineTypeLabel,
} from "./phoneLineType.js";

test("publicPhoneLineTypeLabel maps callable types and hides the rest", () => {
  assert.equal(publicPhoneLineTypeLabel("landline"), "Landline");
  assert.equal(publicPhoneLineTypeLabel("mobile"), "Mobile");
  assert.equal(publicPhoneLineTypeLabel("fixedVoip"), "VoIP");
  assert.equal(publicPhoneLineTypeLabel("nonFixedVoip"), "VoIP");
  assert.equal(publicPhoneLineTypeLabel("tollFree"), "Toll-free");
  assert.equal(publicPhoneLineTypeLabel("personal"), "Personal");
  assert.equal(publicPhoneLineTypeLabel("premium"), null);
  assert.equal(publicPhoneLineTypeLabel("pager"), null);
  assert.equal(publicPhoneLineTypeLabel("unknown"), null);
  assert.equal(publicPhoneLineTypeLabel(null), null);
});

test("groupBusinessesByClaimPhone shares one lookup per dialable number", () => {
  const { groups, invalidIds } = groupBusinessesByClaimPhone([
    { id: "a", phone: "(415) 555-0100" },
    { id: "b", phone: "415-555-0100" },
    { id: "c", phone: "not-a-phone" },
    { id: "d", phone: "" },
  ]);

  assert.deepEqual(groups.get("+14155550100"), ["a", "b"]);
  assert.deepEqual(invalidIds, ["c", "d"]);
});

test("nextLineTypeLookupStep retries once, then gives up on a normal error", () => {
  const error = { status: 500, type: "api" };
  assert.deepEqual(nextLineTypeLookupStep(error, 1), {
    action: "retry",
    delayMs: 0,
  });
  assert.deepEqual(nextLineTypeLookupStep(error, 2), { action: "giveUp" });
});

test("nextLineTypeLookupStep backs off on Twilio 429 and then stops", () => {
  const error = { status: 429, code: 20429, retryAfterSeconds: 2 };
  assert.equal(isTwilioRateLimitError(error), true);
  assert.equal(lookupRateLimitDelayMs(error, 0), 2000);
  assert.deepEqual(nextLineTypeLookupStep(error, 1).action, "retry");
  assert.equal(nextLineTypeLookupStep(error, 4).action, "stop");
});

test("paceWaitMs keeps uncached lookups at five per second", () => {
  assert.equal(PHONE_LINE_TYPE_MIN_INTERVAL_MS, 200);
  assert.equal(paceWaitMs(1000, 1000), 0);
  assert.equal(paceWaitMs(1000, 1200), 200);
  assert.equal(nextAllowedAtAfterLookup(1000, { cached: false }), 1200);
  assert.equal(nextAllowedAtAfterLookup(1000, { cached: true }), 1000);
});
