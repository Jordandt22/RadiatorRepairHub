import { formatHoursText } from "@/lib/businessHoursFormat";

function parseTime(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":");
  return parseInt(hours, 10) * 60 + parseInt(minutes || 0, 10);
}

function formatTodayHoursRange(todayHours) {
  if (!todayHours) return null;

  const hoursText =
    typeof todayHours.hours_text === "string" ? todayHours.hours_text.trim() : "";
  if (hoursText && hoursText.toLowerCase() !== "closed") return hoursText;

  if (!Array.isArray(todayHours.hours) || todayHours.hours.length === 0) {
    return null;
  }

  const formatted = formatHoursText(todayHours.hours);
  return formatted === "Closed" ? null : formatted;
}

function getNowInTimezone(timezone) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = parseInt(
    parts.find((part) => part.type === "hour")?.value ?? "0",
    10
  );
  const minute = parseInt(
    parts.find((part) => part.type === "minute")?.value ?? "0",
    10
  );

  return { weekday, currentMinutes: hour * 60 + minute };
}

/** Current weekday name (e.g. "Monday") in the shop timezone, or local. */
export function getBusinessLocalWeekday(timezone) {
  if (timezone) {
    return getNowInTimezone(timezone).weekday;
  }
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function isWithinPeriod(currentMinutes, openMinutes, closeMinutes) {
  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  // Overnight hours (e.g. 10:00 PM to 2:00 AM)
  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

export function getBusinessOpenStatus(hours, timezone) {
  if (!hours || !Array.isArray(hours)) {
    return { isOpen: false, status: "Hours not available", color: "gray" };
  }

  let currentDay;
  let currentMinutes;

  if (timezone) {
    const shopNow = getNowInTimezone(timezone);
    currentDay = shopNow.weekday;
    currentMinutes = shopNow.currentMinutes;
  } else {
    const now = new Date();
    currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  const todayHours = hours.find((day) => day.day_of_week === currentDay);

  if (!todayHours) {
    return { isOpen: false, status: "Hours not available", color: "gray" };
  }

  if (todayHours.is_closed || !todayHours.hours?.length) {
    return { isOpen: false, status: "Closed", color: "red" };
  }

  try {
    const isOpen = todayHours.hours.some((period) =>
      isWithinPeriod(
        currentMinutes,
        parseTime(period.open),
        parseTime(period.close)
      )
    );
    const hoursRange = formatTodayHoursRange(todayHours);
    const label = isOpen ? "Open" : "Closed";

    return {
      isOpen,
      status: hoursRange ? `${label} · ${hoursRange}` : label,
      color: isOpen ? "green" : "red",
    };
  } catch {
    return { isOpen: false, status: "Hours not available", color: "gray" };
  }
}
