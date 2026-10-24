export const DAY_KEYS = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
];
export const DAY_LABELS = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
};
export function hoursRows(hours) {
    return DAY_KEYS.map((key) => ({
        key,
        label: DAY_LABELS[key],
        value: hours[key],
    }));
}

/**
 * Utility bar: today's hours in the shop timezone, plus open/closed when
 * `hours.timezone` is set. `hours` is null when the shop is closed all day.
 */
export function headerHoursStatus(hours) {
    const key = todayDayKey(hours);
    if (!key) return null;
    const value = hours[key];
    if (!value) return null;
    const status = hours.timezone ? openStatus(hours) : null;
    return {
        day: DAY_LABELS[key],
        hours: value === "Closed" ? null : value,
        open: status ? status.open : null,
    };
}

const WEEKDAY_TO_KEY = {
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
    sun: "sun",
};

/** Day key (mon-sun) for "now" in the shop timezone, or local if timezone unset. */
export function todayDayKey(hours) {
    const dayFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: hours.timezone || undefined,
        weekday: "short",
    });
    const wd = dayFmt.format(new Date()).slice(0, 3).toLowerCase();
    return WEEKDAY_TO_KEY[wd] ?? null;
}
function parseClock(part) {
    const m = part.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m)
        return null;
    let h = Number(m[1]);
    const min = Number(m[2]);
    const ap = m[3].toUpperCase();
    if (ap === "PM" && h !== 12)
        h += 12;
    if (ap === "AM" && h === 12)
        h = 0;
    return h * 60 + min;
}
function windowFor(value) {
    if (value === "Closed")
        return "closed";
    const parts = value.split("-").map((s) => s.trim());
    if (parts.length !== 2)
        return null;
    const start = parseClock(parts[0]);
    const end = parseClock(parts[1]);
    if (start === null || end === null)
        return null;
    return { start, end };
}
export function openStatus(hours) {
    if (!hours.timezone)
        return null;
    const now = new Date();
    const dayFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: hours.timezone,
        weekday: "short",
    });
    const timeFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: hours.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    });
    const wd = dayFmt.format(now).slice(0, 3).toLowerCase();
    const key = WEEKDAY_TO_KEY[wd];
    if (!key)
        return null;
    const today = hours[key];
    if (today === "Closed")
        return { open: false, label: "Closed today" };
    const win = windowFor(today);
    if (!win || win === "closed")
        return { open: false, label: "Closed now" };
    const parts = timeFmt.formatToParts(now);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    const mins = hour * 60 + minute;
    const endLabel = today.split("-")[1]?.trim() ?? "";
    if (mins >= win.start && mins < win.end) {
        return { open: true, label: `Open Now - Closes ${endLabel}` };
    }
    return { open: false, label: "Closed now" };
}
