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
