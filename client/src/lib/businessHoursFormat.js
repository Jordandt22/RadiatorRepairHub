export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_RE = /^([01]\d|2[0-3]):(00|15|30|45)$/;

export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const [hours, minutes] = timeStr.split(":");
  const h = Number(hours);
  const m = Number(minutes || 0);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function isValidQuarterHour(timeStr) {
  return TIME_RE.test(timeStr);
}

export function formatTime12h(timeStr) {
  const minutesTotal = parseTimeToMinutes(timeStr);
  if (minutesTotal == null) return timeStr;
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  if (minutes === 0) return `${hour12} ${period}`;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatHoursText(periods = []) {
  if (!periods?.length) return "Closed";
  return periods
    .map(
      (period) =>
        `${formatTime12h(period.open)} to ${formatTime12h(period.close)}`
    )
    .join(", ");
}

export function buildTimeOptions() {
  const options = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    const value = `${h}:${m}`;
    options.push({ value, label: formatTime12h(value) });
  }
  return options;
}

export function snapToQuarterHour(timeStr) {
  if (isValidQuarterHour(timeStr)) return timeStr;
  const total = parseTimeToMinutes(timeStr);
  if (total == null) return "09:00";
  const snapped = Math.round(total / 15) * 15;
  const clamped = Math.min(Math.max(snapped, 0), 23 * 60 + 45);
  const h = String(Math.floor(clamped / 60)).padStart(2, "0");
  const m = String(clamped % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function splitTimeParts(timeStr) {
  const total = parseTimeToMinutes(snapToQuarterHour(timeStr));
  if (total == null) {
    return { hour12: 9, minute: 0, period: "AM" };
  }
  const hours24 = Math.floor(total / 60);
  const minute = total % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hour12, minute, period };
}

export function joinTimeParts({ hour12, minute, period }) {
  let hours24 = Number(hour12) % 12;
  if (period === "PM") hours24 += 12;
  if (period === "AM" && Number(hour12) === 12) hours24 = 0;
  const h = String(hours24).padStart(2, "0");
  const m = String(Number(minute)).padStart(2, "0");
  return `${h}:${m}`;
}

export const HOUR_12_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const MINUTE_OPTIONS = [0, 15, 30, 45];
export const PERIOD_OPTIONS = ["AM", "PM"];

export function normalizeIncomingHours(hours = []) {
  const byDay = new Map(
    (Array.isArray(hours) ? hours : []).map((day) => [day.day_of_week, day])
  );

  return WEEKDAYS.map((dayOfWeek) => {
    const existing = byDay.get(dayOfWeek);
    if (!existing || existing.is_closed || !existing.hours?.length) {
      return {
        day_of_week: dayOfWeek,
        is_closed: true,
        hours: [],
      };
    }

    return {
      day_of_week: dayOfWeek,
      is_closed: false,
      hours: existing.hours.slice(0, 2).map((period) => ({
        open: snapToQuarterHour(period.open),
        close: snapToQuarterHour(period.close),
      })),
    };
  });
}

export function daysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((day, index) => {
    const other = b[index];
    if (!other) return false;
    if (day.day_of_week !== other.day_of_week) return false;
    if (Boolean(day.is_closed) !== Boolean(other.is_closed)) return false;
    const leftHours = day.is_closed ? [] : day.hours || [];
    const rightHours = other.is_closed ? [] : other.hours || [];
    if (leftHours.length !== rightHours.length) return false;
    return leftHours.every(
      (period, periodIndex) =>
        period.open === rightHours[periodIndex].open &&
        period.close === rightHours[periodIndex].close
    );
  });
}
