import { fetchApi, getApiUri } from "./fetchApi";

async function fetchCategories(path, options) {
  return fetchApi(`/categories${path}`, options);
}

export async function fetchPrimaryCategories(options) {
  return fetchCategories("/primary", options);
}

export async function fetchPrimaryCategoryBySlug(slug, options) {
  return fetchCategories(`/primary/slug/${slug}`, options);
}

export async function fetchSecondaryCategories(options) {
  return fetchCategories("/secondary", options);
}

export function getCategoriesApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/categories${path}` : null;
}

export { getApiUri };
