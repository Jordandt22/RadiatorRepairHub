const CACHE_SECONDS = 3600;
const LOOKBACK_DAYS = 30;

function getPostHogHost() {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  if (!host) return "https://us.i.posthog.com";
  return host.replace(/\/+$/, "");
}

/**
 * Unique visitors from PostHog Web Analytics digest (last 30 days).
 * Successful responses are cached ~1 hour via Next.js fetch revalidate.
 * Returns null when credentials are missing or the request fails (not cached).
 */
export async function getVisitorsLast30Days() {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();

  if (!apiKey || !projectId) {
    return null;
  }

  const url = new URL(
    `${getPostHogHost()}/api/projects/${encodeURIComponent(projectId)}/web_analytics/weekly_digest/`
  );
  url.searchParams.set("days", String(LOOKBACK_DAYS));
  url.searchParams.set("compare", "false");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      // Cache only successful fetches; auth headers vary the cache entry.
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      console.error(
        "[posthogSiteStats] PostHog web analytics failed",
        response.status
      );
      return null;
    }

    const data = await response.json();
    const visitors = Number(data?.visitors?.current);

    if (!Number.isFinite(visitors) || visitors < 0) {
      return null;
    }

    return Math.round(visitors);
  } catch (error) {
    console.error("[posthogSiteStats]", error?.message || error);
    return null;
  }
}

export const SITE_STATS_LOOKBACK_DAYS = LOOKBACK_DAYS;
export const SITE_STATS_CACHE_SECONDS = CACHE_SECONDS;
