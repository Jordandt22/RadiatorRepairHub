import { fetchApi, getApiUri } from "./fetchApi";

const DIRECTORY_REVALIDATE_SECONDS = 60 * 60;
const DIRECTORY_CACHE = { revalidate: DIRECTORY_REVALIDATE_SECONDS };

async function fetchLocation(path, options = DIRECTORY_CACHE) {
  return fetchApi(`/location${path}`, options);
}

export async function fetchStateBusinessCounts(
  { codes, limit } = {},
  options = DIRECTORY_CACHE
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

export async function fetchCityBusinessCounts(stateId, options = DIRECTORY_CACHE) {
  return fetchLocation(`/states/${stateId}/cities/counts`, options);
}

export async function fetchAllCities(options = DIRECTORY_CACHE) {
  return fetchLocation("/cities", options);
}

export async function fetchCitiesByStateId(stateId, options = DIRECTORY_CACHE) {
  return fetchLocation(`/states/${stateId}/cities`, options);
}

export async function fetchCityBySlug(stateId, citySlug, options = DIRECTORY_CACHE) {
  return fetchLocation(`/states/${stateId}/cities/slug/${citySlug}`, options);
}

export async function fetchPostalCodesByCityId(cityId, options = DIRECTORY_CACHE) {
  return fetchLocation(`/cities/${cityId}/postal-codes`, options);
}

export async function fetchPostalCodesByStateId(stateId, options = DIRECTORY_CACHE) {
  return fetchLocation(`/states/${stateId}/postal-codes`, options);
}

export function getLocationApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/location${path}` : null;
}

export { getApiUri };
