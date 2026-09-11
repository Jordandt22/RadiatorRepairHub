/** Skip Next.js Data Cache. Redis on the API is the listing cache. */
export const NO_STORE = { cache: "no-store" };

/**
 * Fetch Data Cache TTL for slowly changing public directory data.
 * Page `export const revalidate` must stay a numeric literal (Next.js segment
 * config); keep those in sync: directory pages = 3600, content pages = 21600.
 * Owner edits still refresh via on-demand /api/revalidate.
 */
export const SHORT_REVALIDATE_SECONDS = 3600; // 1 hour

export const SHORT_CACHE = { revalidate: SHORT_REVALIDATE_SECONDS };

export const SITEMAP_REVALIDATE_SECONDS = 60 * 60 * 24;

export const SITEMAP_CACHE = { revalidate: SITEMAP_REVALIDATE_SECONDS };
