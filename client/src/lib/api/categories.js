import { fetchApi, getApiUri } from "./fetchApi";
import { SHORT_CACHE } from "@/lib/cachePolicy";

async function fetchCategories(path, options = SHORT_CACHE) {
  return fetchApi(`/categories${path}`, options);
}

export async function fetchPrimaryCategories(options = SHORT_CACHE) {
  return fetchCategories("/primary", options);
}

export async function fetchTopPrimaryCategories(
  { limit = 4 } = {},
  options = SHORT_CACHE
) {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetchCategories(`/primary/top?${params.toString()}`, options);
}

export async function fetchPrimaryCategoryBusinessCounts(
  options = SHORT_CACHE
) {
  return fetchCategories("/primary/counts", options);
}

export async function fetchPrimaryCategoryBySlug(slug, options = SHORT_CACHE) {
  return fetchCategories(`/primary/slug/${slug}`, options);
}

export async function fetchSecondaryCategories(options = SHORT_CACHE) {
  return fetchCategories("/secondary", options);
}

export function getCategoriesApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/categories${path}` : null;
}

export { getApiUri };
