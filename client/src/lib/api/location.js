import { fetchApi, getApiUri } from "./fetchApi";
import { SHORT_CACHE } from "@/lib/cachePolicy";

async function fetchLocation(path, options = SHORT_CACHE) {
  return fetchApi(`/location${path}`, options);
}

export async function fetchStateBusinessCounts(
  { codes, limit } = {},
  options = SHORT_CACHE
) {
  const params = new URLSearchParams();
  if (Array.isArray(codes) && codes.length > 0) {
    params.set("codes", codes.join(","));
  } else if (typeof limit === "number") {
    params.set("limit", String(limit));
  }
  const query = params.toString();
  return fetchLocation(`/states/counts${query ? `?${query}` : ""}`, options);
}

export async function fetchCityBusinessCounts(stateId, options = SHORT_CACHE) {
  return fetchLocation(`/states/${stateId}/cities/counts`, options);
}

export async function fetchAllCities(options = SHORT_CACHE) {
  return fetchLocation("/cities", options);
}

export async function fetchCitiesCount(options = SHORT_CACHE) {
  return fetchLocation("/cities/count", options);
}

export async function fetchCitiesForSitemap(options = SHORT_CACHE) {
  return fetchLocation("/cities/sitemap", options);
}

export async function fetchCityCategoriesForSitemap(options = SHORT_CACHE) {
  return fetchLocation("/city-categories/sitemap", options);
}

export async function fetchStateCategoriesForSitemap(options = SHORT_CACHE) {
  return fetchLocation("/state-categories/sitemap", options);
}

export async function fetchCityCategoryCounts(cityId, options = SHORT_CACHE) {
  return fetchLocation(`/cities/${cityId}/category-counts`, options);
}

export async function fetchStateCategoryCounts(stateId, options = SHORT_CACHE) {
  return fetchLocation(`/states/${stateId}/category-counts`, options);
}

export async function fetchCategoryCityCounts(
  categoryId,
  limit = 12,
  options = SHORT_CACHE,
  stateId = null
) {
  const params = new URLSearchParams();
  if (typeof limit === "number") {
    params.set("limit", String(limit));
  }
  if (stateId) {
    params.set("state_id", String(stateId));
  }
  const query = params.toString();
  return fetchLocation(
    `/categories/${categoryId}/city-counts${query ? `?${query}` : ""}`,
    options
  );
}

export async function fetchCategoryStateCounts(
  categoryId,
  limit = 12,
  options = SHORT_CACHE
) {
  const params = new URLSearchParams();
  if (typeof limit === "number") {
    params.set("limit", String(limit));
  }
  const query = params.toString();
  return fetchLocation(
    `/categories/${categoryId}/state-counts${query ? `?${query}` : ""}`,
    options
  );
}

export async function fetchCitiesByStateId(stateId, options = SHORT_CACHE) {
  return fetchLocation(`/states/${stateId}/cities`, options);
}

export async function fetchCityBySlug(stateId, citySlug, options = SHORT_CACHE) {
  return fetchLocation(`/states/${stateId}/cities/slug/${citySlug}`, options);
}

export async function fetchPostalCodesByCityId(cityId, options = SHORT_CACHE) {
  return fetchLocation(`/cities/${cityId}/postal-codes`, options);
}

export async function fetchPostalCodesByStateId(stateId, options = SHORT_CACHE) {
  return fetchLocation(`/states/${stateId}/postal-codes`, options);
}

export function getLocationApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/location${path}` : null;
}

export { getApiUri };
