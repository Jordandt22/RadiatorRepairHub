import { parseTimeToMinutes } from "./businessHoursFormat.js";

/**
 * Claim calls only go out while the shop is open, clamped to daytime hours.
 * A shop that opens at 6 AM should not receive an automated call at 6 AM.
 */
export const CALL_WINDOW_START_MINUTES = 9 * 60; // 9:00 AM local
export const CALL_WINDOW_END_MINUTES = 17 * 60; // 5:00 PM local

export const CALL_WINDOW_LABEL = "9:00 AM to 5:00 PM";

const getNowInTimezone = (timezone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? null;
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return { weekday, currentMinutes: hour * 60 + minute };
};

/**
 * True when `currentMinutes` falls inside a shop period intersected with the
 * allowed daytime window. Overnight periods are clamped by the window, so only
 * the daytime portion counts.
 */
const isWithinClampedPeriod = (currentMinutes, period) => {
  const open = parseTimeToMinutes(period?.open);
  const close = parseTimeToMinutes(period?.close);
  if (open == null || close == null) return false;

  // Overnight period (e.g. 22:00 to 02:00): only its daytime remainder can
  // overlap the 9-5 window, which is the segment from open to end of day.
  const effectiveClose = close > open ? close : 24 * 60;

  const start = Math.max(open, CALL_WINDOW_START_MINUTES);
  const end = Math.min(effectiveClose, CALL_WINDOW_END_MINUTES);
  if (start >= end) return false;

  return currentMinutes >= start && currentMinutes <= end;
};

/**
 * Whether an automated claim call can be placed right now.
 * @returns {{ allowed: boolean, reason: "no_timezone"|"no_hours"|"outside_hours"|null }}
 */
export const getClaimCallWindowStatus = (hours, timezone) => {
  if (!timezone || typeof timezone !== "string" || !timezone.trim()) {
    return { allowed: false, reason: "no_timezone" };
  }

  if (!Array.isArray(hours) || hours.length === 0) {
    return { allowed: false, reason: "no_hours" };
  }

  let now;
  try {
    now = getNowInTimezone(timezone);
  } catch {
    return { allowed: false, reason: "no_timezone" };
  }

  const today = hours.find((day) => day?.day_of_week === now.weekday);
  if (!today || today.is_closed || !Array.isArray(today.hours) || !today.hours.length) {
    return { allowed: false, reason: "outside_hours" };
  }

  const allowed = today.hours.some((period) =>
    isWithinClampedPeriod(now.currentMinutes, period)
  );

  return { allowed, reason: allowed ? null : "outside_hours" };
};
