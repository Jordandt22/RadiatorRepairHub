const REVALIDATE_SECONDS = 60 * 60 * 24;

export function getApiUri() {
  return process.env.NEXT_PUBLIC_API_URI || process.env.API_URI;
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return {
      ok: false,
      error: {
        message: `Expected JSON but received ${contentType || "unknown content type"}`,
        status: response.status,
        preview: text.slice(0, 120),
      },
    };
  }

  try {
    const json = await response.json();
    return { ok: true, json };
  } catch {
    return {
      ok: false,
      error: {
        message: "Invalid JSON response",
        status: response.status,
      },
    };
  }
}

export async function fetchApi(path, options = {}) {
  const apiUri = getApiUri();
  if (!apiUri) {
    return {
      data: null,
      error: { message: "Missing NEXT_PUBLIC_API_URI or API_URI" },
      status: 0,
    };
  }

  const { cache, revalidate = REVALIDATE_SECONDS, ...fetchOptions } = options;

  const fetchInit =
    cache === "no-store"
      ? { cache: "no-store", ...fetchOptions }
      : {
          ...fetchOptions,
          next: { revalidate, ...fetchOptions.next },
        };

  try {
    const response = await fetch(`${apiUri}${path}`, fetchInit);

    const parsed = await parseJsonResponse(response);
    if (!parsed.ok) {
      return {
        data: null,
        error: parsed.error,
        status: parsed.error.status ?? response.status,
      };
    }

    const { json } = parsed;
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
      error: { message: error.message || "Fetch failed" },
      status: 0,
    };
  }
}
