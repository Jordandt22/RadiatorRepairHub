import { SITES, getSiteApiUri, siteTokenKey } from "@/lib/sites";

const LEGACY_TOKEN_KEY = "admin_token";

export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;

    const payload = JSON.parse(
      atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function writeStoredToken(siteId, token) {
  if (typeof window === "undefined") return;

  const key = siteTokenKey(siteId);
  try {
    if (token && !isTokenExpired(token)) {
      localStorage.setItem(key, token);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore quota / private mode
  }
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return;

  try {
    for (const site of SITES) {
      localStorage.removeItem(siteTokenKey(site.id));
    }
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // ignore quota / private mode
  }
}

/** Ask one site's API for an admin session. Tokens are not interchangeable. */
export async function loginToSite(site, password) {
  const apiUri = getSiteApiUri(site);
  if (!apiUri) {
    return {
      siteId: site.id,
      token: null,
      error: { message: `Missing API URL for ${site.name}` },
    };
  }

  try {
    const response = await fetch(`${apiUri}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await response.json();

    if (!response.ok || json.error || !json.data?.token) {
      return {
        siteId: site.id,
        token: null,
        error: json.error ?? { message: "Login failed" },
      };
    }

    return { siteId: site.id, token: json.data.token, error: null };
  } catch (error) {
    return {
      siteId: site.id,
      token: null,
      error: { message: error.message || "Unable to reach the server" },
    };
  }
}
