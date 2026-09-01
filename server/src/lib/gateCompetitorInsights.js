const BASIC_MARKET_KEYS = [
  "totalListings",
  "claimedListings",
  "featuredListings",
];

function pickBasicMarket(market = {}) {
  const picked = {};
  for (const key of BASIC_MARKET_KEYS) {
    picked[key] = Number(market[key] || 0);
  }
  return picked;
}

function impressionShare(impressions, totalImpressions) {
  const total = Number(totalImpressions || 0);
  if (!total) return null;
  return Math.round((Number(impressions || 0) / total) * 1000) / 10;
}

export function gateCompetitorInsights(insights, isFeatured) {
  if (!insights) {
    return insights;
  }

  const access = isFeatured ? "full" : "basic";
  const competitors = Array.isArray(insights.competitors)
    ? insights.competitors
    : [];

  if (!insights.available) {
    return {
      ...insights,
      insightsAccess: access,
      self: null,
      competitors: [],
      competitorCount: 0,
    };
  }

  const market = insights.market || {};
  const self = insights.self || null;

  if (isFeatured) {
    return {
      ...insights,
      insightsAccess: "full",
      self: self
        ? {
            ...self,
            impressionShare: impressionShare(
              self.impressions,
              market.totalImpressions
            ),
          }
        : null,
      competitors,
      competitorCount: competitors.length,
    };
  }

  // Basic tier keeps public market counts and the owner's own rank as a teaser,
  // but never peer performance, benchmarks, or click-derived metrics.
  return {
    ...insights,
    insightsAccess: "basic",
    market: pickBasicMarket(market),
    self: self ? { impressionsRank: self.impressionsRank ?? null } : null,
    competitors: [],
    competitorCount: competitors.length,
  };
}
