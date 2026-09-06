import test from "node:test";
import assert from "node:assert/strict";
import { getClaimCallWindowStatus } from "./claimCallWindow.js";

/**
 * Picks a fixed-offset timezone where the local hour right now is `hour`, so
 * the window tests do not depend on when the suite runs. Etc/GMT zones invert
 * the sign and never observe DST.
 */
function zoneWithLocalHour(hour) {
  let offset = hour - new Date().getUTCHours();
  if (offset > 14) offset -= 24;
  if (offset < -12) offset += 24;

  if (offset === 0) return "Etc/GMT";
  return offset > 0 ? `Etc/GMT-${offset}` : `Etc/GMT+${-offset}`;
}

test("missing timezone blocks the call", () => {
  assert.deepEqual(getClaimCallWindowStatus(null), {
    allowed: false,
    reason: "no_timezone",
  });
});

test("unknown timezone blocks the call", () => {
  assert.deepEqual(getClaimCallWindowStatus("Not/AZone"), {
    allowed: false,
    reason: "no_timezone",
  });
});

test("midday local time is allowed", () => {
  const timezone = zoneWithLocalHour(12);
  assert.deepEqual(getClaimCallWindowStatus(timezone), {
    allowed: true,
    reason: null,
  });
});

test("7am local is allowed", () => {
  const timezone = zoneWithLocalHour(7);
  assert.deepEqual(getClaimCallWindowStatus(timezone), {
    allowed: true,
    reason: null,
  });
});

test("9pm local is allowed", () => {
  const timezone = zoneWithLocalHour(21);
  assert.deepEqual(getClaimCallWindowStatus(timezone), {
    allowed: true,
    reason: null,
  });
});

test("before 7am is blocked", () => {
  const timezone = zoneWithLocalHour(6);
  assert.deepEqual(getClaimCallWindowStatus(timezone), {
    allowed: false,
    reason: "outside_hours",
  });
});

test("after 9pm is blocked", () => {
  const timezone = zoneWithLocalHour(22);
  assert.deepEqual(getClaimCallWindowStatus(timezone), {
    allowed: false,
    reason: "outside_hours",
  });
});
