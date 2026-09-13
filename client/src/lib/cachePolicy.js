/** Skip Next.js Data Cache. Redis on the API is the listing cache. */
export const NO_STORE = { cache: "no-store" };

const isDev = process.env.NODE_ENV === "development";

/**
 * Fetch Data Cache TTL for slowly changing public directory data.
 * Page `export const revalidate` must stay a numeric literal (Next.js segment
 * config); keep those in sync: directory pages = 3600, content pages = 21600.
 * Owner edits still refresh via on-demand /api/revalidate.
 *
 * Development uses a short TTL so ingest and listing edits show up without
 * waiting out the production hour.
 */
export const SHORT_REVALIDATE_SECONDS = isDev ? 10 : 3600;

export const SHORT_CACHE = { revalidate: SHORT_REVALIDATE_SECONDS };

export const SITEMAP_REVALIDATE_SECONDS = 60 * 60 * 24;

export const SITEMAP_CACHE = { revalidate: SITEMAP_REVALIDATE_SECONDS };
