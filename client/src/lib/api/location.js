import { fetchApi, getApiUri } from "./fetchApi";

async function fetchLocation(path, options) {
  return fetchApi(`/location${path}`, options);
}

export async function fetchAllCities(options) {
  return fetchLocation("/cities", options);
}

export async function fetchCitiesByStateId(stateId, options) {
  return fetchLocation(`/states/${stateId}/cities`, options);
}

export async function fetchCityBySlug(stateId, citySlug, options) {
  return fetchLocation(`/states/${stateId}/cities/slug/${citySlug}`, options);
}

export async function fetchPostalCodesByCityId(cityId, options) {
  return fetchLocation(`/cities/${cityId}/postal-codes`, options);
}

export async function fetchPostalCodesByStateId(stateId, options) {
  return fetchLocation(`/states/${stateId}/postal-codes`, options);
}

export function getLocationApiUrl(path) {
  const apiUri = getApiUri();
  return apiUri ? `${apiUri}/location${path}` : null;
}

export { getApiUri };
