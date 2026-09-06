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

function weekdayIn(timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  }).format(new Date());
}

function hoursFor(timezone, periods) {
  return [{ day_of_week: weekdayIn(timezone), is_closed: false, hours: periods }];
}

test("missing timezone blocks the call", () => {
  assert.deepEqual(getClaimCallWindowStatus([], null), {
    allowed: false,
    reason: "no_timezone",
  });
});

test("unknown timezone blocks the call", () => {
  const hours = [
    { day_of_week: "Monday", is_closed: false, hours: [{ open: "09:00", close: "17:00" }] },
  ];
  assert.deepEqual(getClaimCallWindowStatus(hours, "Not/AZone"), {
    allowed: false,
    reason: "no_timezone",
  });
});

test("missing hours blocks the call", () => {
  assert.deepEqual(getClaimCallWindowStatus([], "America/Los_Angeles"), {
    allowed: false,
    reason: "no_hours",
  });
});

test("open now inside 9-5 is allowed", () => {
  const timezone = zoneWithLocalHour(12);
  const hours = hoursFor(timezone, [{ open: "08:00", close: "20:00" }]);

  assert.deepEqual(getClaimCallWindowStatus(hours, timezone), {
    allowed: true,
    reason: null,
  });
});

test("open now but before 9am is blocked", () => {
  const timezone = zoneWithLocalHour(6);
  const hours = hoursFor(timezone, [{ open: "06:00", close: "20:00" }]);

  assert.deepEqual(getClaimCallWindowStatus(hours, timezone), {
    allowed: false,
    reason: "outside_hours",
  });
});

test("open now but after 5pm is blocked", () => {
  const timezone = zoneWithLocalHour(19);
  const hours = hoursFor(timezone, [{ open: "09:00", close: "22:00" }]);

  assert.deepEqual(getClaimCallWindowStatus(hours, timezone), {
    allowed: false,
    reason: "outside_hours",
  });
});

test("shop hours that never overlap 9-5 are blocked", () => {
  const timezone = zoneWithLocalHour(12);
  const hours = hoursFor(timezone, [{ open: "06:00", close: "08:00" }]);

  assert.deepEqual(getClaimCallWindowStatus(hours, timezone), {
    allowed: false,
    reason: "outside_hours",
  });
});

test("split hours allow a call during the second period", () => {
  const timezone = zoneWithLocalHour(14);
  const hours = hoursFor(timezone, [
    { open: "08:00", close: "11:00" },
    { open: "13:00", close: "17:00" },
  ]);

  assert.deepEqual(getClaimCallWindowStatus(hours, timezone), {
    allowed: true,
    reason: null,
  });
});

test("closed today blocks the call", () => {
  const timezone = zoneWithLocalHour(12);
  const hours = [
    { day_of_week: weekdayIn(timezone), is_closed: true, hours: [] },
  ];

  assert.deepEqual(getClaimCallWindowStatus(hours, timezone), {
    allowed: false,
    reason: "outside_hours",
  });
});

test("overnight hours only count their daytime overlap", () => {
  const timezone = zoneWithLocalHour(12);
  const hours = hoursFor(timezone, [{ open: "22:00", close: "02:00" }]);

  assert.deepEqual(getClaimCallWindowStatus(hours, timezone), {
    allowed: false,
    reason: "outside_hours",
  });
});
