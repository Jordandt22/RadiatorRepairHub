const REVALIDATE_SECONDS = 60 * 60 * 24;

function getApiUri() {
  return process.env.NEXT_PUBLIC_API_URI || process.env.API_URI;
}

async function fetchCategories(path, options = {}) {
  const apiUri = getApiUri();
  if (!apiUri) {
    throw new Error("Missing NEXT_PUBLIC_API_URI or API_URI");
  }

  const response = await fetch(`${apiUri}/categories${path}`, {
    ...options,
    next: { revalidate: REVALIDATE_SECONDS, ...options.next },
  });

  const json = await response.json();

  if (!response.ok || json.error) {
    return { data: null, error: json.error, status: response.status };
  }

  return { data: json.data, error: null, status: response.status };
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
  return `${getApiUri()}/categories${path}`;
}
