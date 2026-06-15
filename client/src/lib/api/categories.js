import { fetchApi, getApiUri } from "./fetchApi";

const REFERENCE_CACHE = { cache: "no-store" };

async function fetchCategories(path, options = REFERENCE_CACHE) {
  return fetchApi(`/categories${path}`, options);
}

export async function fetchPrimaryCategories(options = REFERENCE_CACHE) {
  return fetchCategories("/primary", options);
}

export async function fetchPrimaryCategoryBySlug(slug, options = REFERENCE_CACHE) {
  return fetchCategories(`/primary/slug/${slug}`, options);
}

export async function fetchSecondaryCategories(options = REFERENCE_CACHE) {
  return fetchCategories("/secondary", options);
}

export function getCategoriesApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/categories${path}` : null;
}

export { getApiUri };
