/**
 * Claim verification calls only go out during a daytime local window.
 * Shop open/closed status is ignored — owners often claim after closing.
 */
export const CALL_WINDOW_START_MINUTES = 7 * 60; // 7:00 AM local
/** Inclusive through 9:59 PM so the full 9 PM hour is usable. */
export const CALL_WINDOW_END_MINUTES = 21 * 60 + 59;

export const CALL_WINDOW_LABEL = "7:00 AM to 9:00 PM";

const getNowInTimezone = (timezone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0"
  );

  return { currentMinutes: hour * 60 + minute };
};

/**
 * Whether an automated claim call can be placed right now.
 * @returns {{ allowed: boolean, reason: "no_timezone"|"outside_hours"|null }}
 */
export const getClaimCallWindowStatus = (timezone) => {
  if (!timezone || typeof timezone !== "string" || !timezone.trim()) {
    return { allowed: false, reason: "no_timezone" };
  }

  let now;
  try {
    now = getNowInTimezone(timezone);
  } catch {
    return { allowed: false, reason: "no_timezone" };
  }

  const allowed =
    now.currentMinutes >= CALL_WINDOW_START_MINUTES &&
    now.currentMinutes <= CALL_WINDOW_END_MINUTES;

  return { allowed, reason: allowed ? null : "outside_hours" };
};
