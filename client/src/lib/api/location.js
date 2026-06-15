import { fetchApi, getApiUri } from "./fetchApi";

const REFERENCE_CACHE = { cache: "no-store" };

async function fetchLocation(path, options = REFERENCE_CACHE) {
  return fetchApi(`/location${path}`, options);
}

export async function fetchAllCities(options = REFERENCE_CACHE) {
  return fetchLocation("/cities", options);
}

export async function fetchCitiesByStateId(stateId, options = REFERENCE_CACHE) {
  return fetchLocation(`/states/${stateId}/cities`, options);
}

export async function fetchCityBySlug(stateId, citySlug, options = REFERENCE_CACHE) {
  return fetchLocation(`/states/${stateId}/cities/slug/${citySlug}`, options);
}

export async function fetchPostalCodesByCityId(cityId, options = REFERENCE_CACHE) {
  return fetchLocation(`/cities/${cityId}/postal-codes`, options);
}

export async function fetchPostalCodesByStateId(stateId, options = REFERENCE_CACHE) {
  return fetchLocation(`/states/${stateId}/postal-codes`, options);
}

export function getLocationApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/location${path}` : null;
}

export { getApiUri };
