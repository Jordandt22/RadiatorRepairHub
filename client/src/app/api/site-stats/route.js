import { NextResponse } from "next/server";
import {
  getVisitorsLast30Days,
  SITE_STATS_CACHE_SECONDS,
  SITE_STATS_LOOKBACK_DAYS,
} from "@/lib/analytics/posthogSiteStats";

export const revalidate = 3600;

/**
 * Public site stats for marketing surfaces (home hero, pricing later).
 * Visitors come from PostHog Web Analytics and are cached ~1 hour.
 */
export async function GET() {
  const visitorsLast30Days = await getVisitorsLast30Days();

  return NextResponse.json(
    {
      visitorsLast30Days,
      lookbackDays: SITE_STATS_LOOKBACK_DAYS,
      cacheSeconds: SITE_STATS_CACHE_SECONDS,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${SITE_STATS_CACHE_SECONDS}, stale-while-revalidate=600`,
      },
    }
  );
}
