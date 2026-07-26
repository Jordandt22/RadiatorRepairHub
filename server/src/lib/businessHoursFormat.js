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

export function normalizeDayHours(day) {
  const dayOfWeek = day?.day_of_week;
  const isClosed = Boolean(day?.is_closed);
  if (isClosed) {
    return {
      day_of_week: dayOfWeek,
      is_closed: true,
      hours: [],
      hours_text: "Closed",
    };
  }

  const hours = (Array.isArray(day?.hours) ? day.hours : [])
    .slice(0, 2)
    .map((period) => ({
      open: period.open,
      close: period.close,
    }));

  return {
    day_of_week: dayOfWeek,
    is_closed: false,
    hours,
    hours_text: formatHoursText(hours),
  };
}

export function daysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  const left = [...a]
    .map(normalizeDayHours)
    .sort((x, y) => WEEKDAYS.indexOf(x.day_of_week) - WEEKDAYS.indexOf(y.day_of_week));
  const right = [...b]
    .map(normalizeDayHours)
    .sort((x, y) => WEEKDAYS.indexOf(x.day_of_week) - WEEKDAYS.indexOf(y.day_of_week));

  return left.every((day, index) => {
    const other = right[index];
    if (!other) return false;
    if (day.day_of_week !== other.day_of_week) return false;
    if (day.is_closed !== other.is_closed) return false;
    if (day.hours.length !== other.hours.length) return false;
    return day.hours.every(
      (period, periodIndex) =>
        period.open === other.hours[periodIndex].open &&
        period.close === other.hours[periodIndex].close
    );
  });
}

export function buildOpeningHoursConfirmation(date = new Date()) {
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `Last updated ${formatted}`;
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
