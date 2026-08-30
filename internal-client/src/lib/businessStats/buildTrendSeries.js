const IMPRESSION_KEYS = [
  "impressions_search",
  "impressions_featured",
  "impressions_top_verified",
  "impressions_state",
  "impressions_city",
  "impressions_category",
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateKey(isoDate) {
  return String(isoDate || "").slice(0, 10);
}

function startOfUtcDay(isoDate) {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function rowImpressions(row) {
  if (!row) return 0;
  const sourceSum = IMPRESSION_KEYS.reduce(
    (sum, key) => sum + Number(row[key] || 0),
    0
  );
  if (sourceSum > 0) return sourceSum;
  return Number(row.impressions || 0);
}

function inclusiveUtcDays(start, end) {
  return Math.max(1, Math.round((end - start) / MS_PER_DAY) + 1);
}

function fillDailySeries(daily = [], days = 7, startDate, endDate, mapRow) {
  const today = startOfUtcDay(dateKey(endDate) || dateKey(new Date().toISOString()));
  const rows = Array.isArray(daily) ? daily : [];
  const byDate = new Map(
    rows.map((row) => [dateKey(row.stat_date), row])
  );

  let start;
  let rangeDays;

  if (days === "all") {
    const first =
      startDate ||
      (rows[0] ? dateKey(rows[0].stat_date) : dateKey(today.toISOString()));
    start = startOfUtcDay(first);
    if (start > today) start = today;
    rangeDays = inclusiveUtcDays(start, today);
  } else {
    const range = Math.max(1, Number(days) || 7);
    start = startDate
      ? startOfUtcDay(String(startDate).slice(0, 10))
      : (() => {
          const fromToday = new Date(today);
          fromToday.setUTCDate(today.getUTCDate() - (range - 1));
          return fromToday;
        })();
    rangeDays = range;
  }

  const series = [];
  for (let index = 0; index < rangeDays; index += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    const date = dateKey(day.toISOString());
    series.push({ date, ...mapRow(byDate.get(date)) });
  }

  return series;
}

export function buildTrendSeries(
  daily = [],
  days = 7,
  startDate,
  endDate
) {
  return fillDailySeries(daily, days, startDate, endDate, (row) => ({
    impressions: rowImpressions(row),
    listing_clicks: Number(row?.listing_clicks || 0),
    page_views: Number(row?.page_views || 0),
  }));
}

export function buildSearchTrendSeries(
  daily = [],
  days = 7,
  startDate,
  endDate
) {
  return fillDailySeries(daily, days, startDate, endDate, (row) => ({
    searches: Number(row?.searches || 0),
    zero_result_searches: Number(row?.zero_result_searches || 0),
  }));
}

export function formatTrendTick(date, days) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  if (days === 1) {
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  }
  if (days === 7) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });
  }
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatTrendLabel(date) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
