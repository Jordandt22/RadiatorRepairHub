/** Skip Next.js Data Cache. Redis on the API is the listing cache. */
export const NO_STORE = { cache: "no-store" };

/**
 * Public directory pages (business, city, state, category, search, home).
 * Owner/admin edits still refresh via on-demand /api/revalidate.
 */
export const DIRECTORY_REVALIDATE_SECONDS = 60 * 60; // 1 hour

/** Rarely changing content (FAQ, blogs, shop). */
export const CONTENT_REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

/** @deprecated Prefer DIRECTORY_REVALIDATE_SECONDS — kept for existing fetch helpers. */
export const SHORT_REVALIDATE_SECONDS = DIRECTORY_REVALIDATE_SECONDS;

export const SHORT_CACHE = { revalidate: DIRECTORY_REVALIDATE_SECONDS };

export const SITEMAP_REVALIDATE_SECONDS = 60 * 60 * 24;

export const SITEMAP_CACHE = { revalidate: SITEMAP_REVALIDATE_SECONDS };
