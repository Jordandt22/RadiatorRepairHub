const FETCH_TIMEOUT_MS = 8000;

/**
 * Normalize a website URL (adds https:// when protocol is missing).
 */
export function normalizeWebsiteUrl(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

/**
 * Check that a website URL is syntactically valid and reachable over HTTP(S).
 */
export async function verifyWebsiteReachable(rawUrl) {
  const normalized = normalizeWebsiteUrl(rawUrl);
  if (!normalized) {
    return {
      ok: false,
      error: {
        type: "invalid",
        message: "Please enter a valid website URL.",
      },
    };
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      ok: false,
      error: {
        type: "invalid",
        message: "Please enter a valid website URL.",
      },
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      ok: false,
      error: {
        type: "invalid",
        message: "Website URL must start with http:// or https://.",
      },
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let response = await fetch(parsed.toString(), {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "RadiatorRepairHub-WebsiteCheck/1.0" },
    });

    // Some hosts reject HEAD; fall back to GET
    if (response.status === 405 || response.status === 501) {
      response = await fetch(parsed.toString(), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "RadiatorRepairHub-WebsiteCheck/1.0" },
      });
    }

    if (response.status >= 200 && response.status < 400) {
      return { ok: true, url: parsed.toString(), status: response.status };
    }

    // Retry once with GET if HEAD returned an error-ish status
    if (response.status >= 400) {
      const getResponse = await fetch(parsed.toString(), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "RadiatorRepairHub-WebsiteCheck/1.0" },
      });

      if (getResponse.status >= 200 && getResponse.status < 400) {
        return {
          ok: true,
          url: parsed.toString(),
          status: getResponse.status,
        };
      }

      return {
        ok: false,
        error: {
          type: "unreachable",
          status: getResponse.status,
          message: "This website does not appear to be reachable.",
        },
      };
    }

    return { ok: true, url: parsed.toString(), status: response.status };
  } catch (error) {
    const aborted = error?.name === "AbortError";
    return {
      ok: false,
      error: {
        type: aborted ? "timeout" : "network",
        message: aborted
          ? "Website check timed out. Please verify the URL and try again."
          : "This website does not appear to be reachable.",
        cause: error,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
