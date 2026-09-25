import { NextResponse } from "next/server";
import { getPricingSiteStats } from "@/lib/analytics/pricingSiteStats";
import { SITE_STATS_CACHE_SECONDS } from "@/lib/analytics/posthogSiteStats";

export const revalidate = 3600;

/**
 * Public site stats for marketing surfaces (home hero, pricing).
 * Aggregates PostHog visitors, directory engagement, and listing counts.
 */
export async function GET() {
  const stats = await getPricingSiteStats();

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": `public, s-maxage=${SITE_STATS_CACHE_SECONDS}, stale-while-revalidate=600`,
    },
  });
}
