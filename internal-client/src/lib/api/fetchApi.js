export function getApiUri() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const version = process.env.NEXT_PUBLIC_API_VERSION;
  if (!base || !version) return null;
  return `${base}/v${version}/api`;
}

export async function fetchApi(path, options = {}) {
  const apiUri = getApiUri();
  if (!apiUri) {
    return {
      data: null,
      error: { message: "Missing NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_VERSION" },
      status: 0,
    };
  }

  const { accessToken, headers, ...fetchOptions } = options;
  const requestHeaders = {
    "Content-Type": "application/json",
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
