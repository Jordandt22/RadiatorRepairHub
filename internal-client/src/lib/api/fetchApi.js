import { getActiveSite, getSiteApiUri } from "@/lib/sites";

/** API base for the active site, so every admin call follows the site switcher. */
export function getApiUri() {
  return getSiteApiUri(getActiveSite());
}

export async function fetchApi(path, options = {}) {
  const site = getActiveSite();
  const apiUri = getSiteApiUri(site);
  if (!apiUri) {
    return {
      data: null,
      error: {
        message: `Missing API URL for ${site?.name || "the active site"}`,
      },
      status: 0,
    };
  }

  const { accessToken, headers, ...fetchOptions } = options;
  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
  const requestHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${apiUri}${path}`, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    const json = await response.json();

    if (!response.ok || json.error) {
      return {
        data: null,
        error: json.error ?? { message: "API request failed" },
        status: response.status,
      };
    }

    return { data: json.data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: { message: error.message || "Unable to reach the server" },
      status: 0,
    };
  }
}
