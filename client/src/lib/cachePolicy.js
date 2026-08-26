/** Skip Next.js Data Cache. Redis on the API is the listing cache. */
export const NO_STORE = { cache: "no-store" };

/** Short Next.js cache for slowly changing public directory data. */
export const SHORT_REVALIDATE_SECONDS = 120;

export const SHORT_CACHE = { revalidate: SHORT_REVALIDATE_SECONDS };

export const SITEMAP_REVALIDATE_SECONDS = 60 * 60 * 24;

export const SITEMAP_CACHE = { revalidate: SITEMAP_REVALIDATE_SECONDS };
