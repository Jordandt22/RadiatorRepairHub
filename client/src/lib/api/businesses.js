import { fetchApi } from "./fetchApi";

const REFERENCE_CACHE = { cache: "no-store" };

export async function fetchBusinessSlugsForSitemap(options = REFERENCE_CACHE) {
  return fetchApi("/businesses/sitemap-slugs", options);
}

export async function fetchBusinessBySlug(slug, options = REFERENCE_CACHE) {
  return fetchApi(`/businesses/${slug}`, options);
}

export async function fetchFeaturedBusinesses(options = REFERENCE_CACHE) {
  return fetchApi("/businesses/featured", options);
}

export async function fetchBusinessesByCategory(
  primaryCategoryId,
  page = 1,
  limit = 12,
  options = REFERENCE_CACHE
) {
  return fetchApi(`/businesses/search?page=${page}&limit=${limit}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      primary_category_id: primaryCategoryId,
      sort_option: 1,
    }),
    ...options,
  });
}
