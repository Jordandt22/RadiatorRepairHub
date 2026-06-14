const REVALIDATE_SECONDS = 60 * 60 * 24;

function getApiUri() {
  return process.env.NEXT_PUBLIC_API_URI || process.env.API_URI;
}

async function fetchLocation(path, options = {}) {
  const apiUri = getApiUri();
  if (!apiUri) {
    throw new Error("Missing NEXT_PUBLIC_API_URI or API_URI");
  }

  const response = await fetch(`${apiUri}/location${path}`, {
    ...options,
    next: { revalidate: REVALIDATE_SECONDS, ...options.next },
  });

  const json = await response.json();

  if (!response.ok || json.error) {
    return { data: null, error: json.error, status: response.status };
  }

  return { data: json.data, error: null, status: response.status };
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
  return `${getApiUri()}/location${path}`;
}
