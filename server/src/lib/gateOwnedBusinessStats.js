const BASIC_TOTAL_KEYS = ["page_views", "impressions"];

function pickTotals(totals = {}) {
  return {
    page_views: Number(totals.page_views || 0),
    impressions: Number(totals.impressions || 0),
  };
}

function pickComparisonTotals(comparisonTotals = {}) {
  const picked = {};
  for (const key of BASIC_TOTAL_KEYS) {
    if (comparisonTotals[key]) {
      picked[key] = comparisonTotals[key];
    }
  }
  return picked;
}

function sanitizeDailyForBasic(daily = []) {
  if (!Array.isArray(daily)) return [];
  return daily.map((row) => ({
    ...row,
    listing_clicks: 0,
    listing_clicks_search: 0,
    listing_clicks_featured: 0,
    listing_clicks_top_verified: 0,
    listing_clicks_state: 0,
    listing_clicks_city: 0,
    listing_clicks_category: 0,
    listing_clicks_nearby: 0,
  }));
}

export function gateOwnedBusinessStats(stats, isFeatured) {
  if (!stats) {
    return stats;
  }

  if (isFeatured) {
    return {
      ...stats,
      analyticsAccess: "full",
    };
  }

  const comparison = stats.comparison
    ? {
        label: stats.comparison.label,
        totals: pickComparisonTotals(stats.comparison.totals),
        avgPosition: null,
        ctr: null,
      }
    : null;

  return {
    ...stats,
    analyticsAccess: "basic",
    daily: sanitizeDailyForBasic(stats.daily),
    totals: pickTotals(stats.totals),
    ctr: null,
    avgPosition: null,
    impressionsBySource: stats.impressionsBySource ?? null,
    clicksBySource: null,
    ctrBySource: null,
    avgPositionBySource: null,
    comparison,
  };
}
