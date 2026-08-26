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
