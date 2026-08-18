import { fetchApi, getApiUri } from "./fetchApi";

const DIRECTORY_REVALIDATE_SECONDS = 60 * 60;
const DIRECTORY_CACHE = { revalidate: DIRECTORY_REVALIDATE_SECONDS };

async function fetchCategories(path, options = DIRECTORY_CACHE) {
  return fetchApi(`/categories${path}`, options);
}

export async function fetchPrimaryCategories(options = DIRECTORY_CACHE) {
  return fetchCategories("/primary", options);
}

export async function fetchTopPrimaryCategories(
  { limit = 4 } = {},
  options = DIRECTORY_CACHE
) {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetchCategories(`/primary/top?${params.toString()}`, options);
}

export async function fetchPrimaryCategoryBusinessCounts(
  options = DIRECTORY_CACHE
) {
  return fetchCategories("/primary/counts", options);
}

export async function fetchPrimaryCategoryBySlug(slug, options = DIRECTORY_CACHE) {
  return fetchCategories(`/primary/slug/${slug}`, options);
}

export async function fetchSecondaryCategories(options = DIRECTORY_CACHE) {
  return fetchCategories("/secondary", options);
}

export function getCategoriesApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/categories${path}` : null;
}

export { getApiUri };
