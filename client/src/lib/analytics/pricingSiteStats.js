import { cache } from "react";
import {
  getVisitorsLast30Days,
  SITE_STATS_CACHE_SECONDS,
  SITE_STATS_LOOKBACK_DAYS,
} from "@/lib/analytics/posthogSiteStats";
import { fetchDirectoryTotals } from "@/lib/api/cachedReads";
import { fetchApi } from "@/lib/api/fetchApi";

function toNonNegInt(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

async function fetchEngagementFromApi() {
  // Cache-bust query when engagement payload shape changes (Next fetch revalidate).
  const { data, error } = await fetchApi("/site-stats?v=2", {
    revalidate: SITE_STATS_CACHE_SECONDS,
  });

  if (error || !data) {
    return {
      phoneClicksLast30Days: null,
      pageViewsLast30Days: null,
      searchesLast30Days: null,
    };
  }

  return {
    phoneClicksLast30Days: toNonNegInt(data.phoneClicksLast30Days),
    pageViewsLast30Days: toNonNegInt(data.pageViewsLast30Days),
    searchesLast30Days: toNonNegInt(data.searchesLast30Days),
  };
}

/**
 * Aggregated public stats for the pricing page (and /api/site-stats).
 * Individual fields may be null when a source fails; callers should hide those.
 */
export const getPricingSiteStats = cache(async () => {
  const [visitorsLast30Days, engagement, directoryTotals] = await Promise.all([
    getVisitorsLast30Days(),
    fetchEngagementFromApi(),
    fetchDirectoryTotals().catch(() => null),
  ]);

  const listedBusinesses = toNonNegInt(directoryTotals?.totalBusinesses);

  return {
    visitorsLast30Days,
    phoneClicksLast30Days: engagement.phoneClicksLast30Days,
    pageViewsLast30Days: engagement.pageViewsLast30Days,
    searchesLast30Days: engagement.searchesLast30Days,
    listedBusinesses,
    lookbackDays: SITE_STATS_LOOKBACK_DAYS,
    cacheSeconds: SITE_STATS_CACHE_SECONDS,
  };
});
