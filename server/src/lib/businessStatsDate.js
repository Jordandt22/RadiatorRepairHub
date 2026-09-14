export const BUSINESS_STATS_TIMEZONE = "America/Los_Angeles";

export function businessStatDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_STATS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dateKeyOffset(isoDate, offsetDays) {
  const day = new Date(`${isoDate}T00:00:00.000Z`);
  day.setUTCDate(day.getUTCDate() + offsetDays);
  return day.toISOString().slice(0, 10);
}

function timezoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "numeric",
  }).formatToParts(date);
  const tz = parts.find((part) => part.type === "timeZoneName")?.value || "GMT";
  const match = tz.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] || 0);
  return sign * (hours * 60 + minutes) * 60 * 1000;
}

/** UTC ISO for midnight of `dateKey` (YYYY-MM-DD) in the stats timezone. */
export function dateKeyStartIso(
  dateKey,
  timeZone = BUSINESS_STATS_TIMEZONE
) {
  const utcMidnight = Date.parse(`${dateKey}T00:00:00.000Z`);
  const probe = new Date(utcMidnight + 12 * 60 * 60 * 1000);
  const offsetMs = timezoneOffsetMs(probe, timeZone);
  return new Date(utcMidnight - offsetMs).toISOString();
}
