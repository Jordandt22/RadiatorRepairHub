import { logger } from "./logger.js";
import { getWebBaseUrl } from "./constants/messages.js";
import {
  deleteCacheData,
  deleteCacheDataByPrefix,
  getBusinessByIdKey,
  getBusinessBySlugKey,
  getTopVerifiedBusinessesKey,
} from "../redis/redis.js";

/**
 * Clear Redis entries for a single business listing payload.
 */
export async function invalidateBusinessListingCache(business) {
  if (!business?.id) return;

  await deleteCacheData(getBusinessByIdKey(business.id).key);
  if (business.slug) {
    await deleteCacheData(getBusinessBySlugKey(business.slug).key);
  }
}

/**
 * Ask the Next.js app to drop cached pages/data for claim-status changes.
 * Best-effort: never throws to callers.
 */
export async function revalidateClientCache({
  paths = [],
  tags = [],
} = {}) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    logger.warn(
      "Skipping Next.js revalidation: REVALIDATE_SECRET is not set"
    );
    return;
  }

  let baseUrl;
  try {
    baseUrl = getWebBaseUrl();
  } catch {
    baseUrl = null;
  }

  if (!baseUrl) {
    logger.warn("Skipping Next.js revalidation: WEB_URL is not set");
    return;
  }

  const uniquePaths = [...new Set(paths.filter(Boolean))];
  const uniqueTags = [...new Set(tags.filter(Boolean))];
  if (!uniquePaths.length && !uniqueTags.length) return;

  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ paths: uniquePaths, tags: uniqueTags }),
    });

    if (!response.ok) {
      const preview = await response.text().catch(() => "");
      logger.error(
        {
          status: response.status,
          preview: preview.slice(0, 200),
          paths: uniquePaths,
          tags: uniqueTags,
        },
        "Next.js revalidation request failed"
      );
    }
  } catch (err) {
    logger.error({ err }, "Next.js revalidation request errored");
  }
}

/**
 * After claim / unclaim / account delete: clear Redis + Next.js caches so
 * Verified badge and Top Verified home strip update immediately.
 */
const PUBLIC_DIRECTORY_CACHE_PREFIXES = [
  "BUSINESS_SITEMAP_SLUGS",
  "CITIES_SITEMAP",
  "CITY_CATEGORIES_SITEMAP",
  "STATE_CATEGORIES_SITEMAP",
  "CITY_CATEGORY_COUNTS",
  "STATE_CATEGORY_COUNTS",
  "CATEGORY_CITY_COUNTS",
  "CATEGORY_STATE_COUNTS",
  "PRIMARY_CATEGORY_BUSINESS_COUNTS",
  "PRIMARY_CATEGORIES_TOP",
  "STATE_BUSINESS_COUNTS",
  "CITY_BUSINESS_COUNTS",
  "FEATURED_BUSINESSES",
  "SEARCHED_BUSINESSES",
];

/**
 * After an admin hides or shows a shop: drop the public listing, directory
 * counts, sitemap, and the Next.js page for that slug.
 */
export async function invalidateHiddenBusinessCaches(business) {
  if (!business?.id) return;

  try {
    await invalidateBusinessListingCache(business);
    await deleteCacheData(getTopVerifiedBusinessesKey().key);
    for (const prefix of PUBLIC_DIRECTORY_CACHE_PREFIXES) {
      await deleteCacheDataByPrefix(prefix);
    }
  } catch {
    // best-effort
  }

  await revalidateClientCache({
    paths: [
      "/",
      "/sitemap.xml",
      business.slug ? `/business/${business.slug}` : null,
    ],
    tags: [
      "top-verified",
      "business-listings",
      business.slug ? `business:${business.slug}` : null,
    ],
  });
}

export async function invalidateClaimStatusCaches(businesses) {
  const list = (Array.isArray(businesses) ? businesses : [businesses]).filter(
    Boolean
  );

  for (const business of list) {
    try {
      await invalidateBusinessListingCache(business);
    } catch {
      // best-effort
    }
  }

  try {
    await deleteCacheData(getTopVerifiedBusinessesKey().key);
    await deleteCacheDataByPrefix("SEARCHED_BUSINESSES");
    await deleteCacheDataByPrefix("FEATURED_BUSINESSES");
  } catch {
    // best-effort
  }

  const slugs = list.map((b) => b.slug).filter(Boolean);
  await revalidateClientCache({
    paths: ["/", ...slugs.map((slug) => `/business/${slug}`)],
    tags: ["top-verified", ...slugs.map((slug) => `business:${slug}`)],
  });
}
