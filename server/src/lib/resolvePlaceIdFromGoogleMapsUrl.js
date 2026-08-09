import { getPlacesApiKey } from "../cdn-upload/places.js";

const PLACE_ID_PATTERNS = [
  /[?&](?:query_place_id|place_id)=([A-Za-z0-9_-]+)/i,
  /!1s(ChIJ[A-Za-z0-9_-]+)/,
  /\/places\/(ChIJ[A-Za-z0-9_-]+)/i,
  /\b(ChIJ[A-Za-z0-9_-]{20,})\b/,
];

const stripPlacesPrefix = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("places/")
    ? trimmed.slice("places/".length)
    : trimmed;
};

const getOptionalPlacesApiKey = () => {
  try {
    return getPlacesApiKey();
  } catch {
    return null;
  }
};

export const extractPlaceIdFromMapsUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return null;

  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    decoded = url;
  }

  for (const pattern of PLACE_ID_PATTERNS) {
    const match = decoded.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

export const extractCoordsFromMapsUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return null;

  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      latitude: Number(atMatch[1]),
      longitude: Number(atMatch[2]),
    };
  }

  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return {
      latitude: Number(qMatch[1]),
      longitude: Number(qMatch[2]),
    };
  }

  return null;
};

export const extractPlaceNameFromMapsUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return null;

  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/maps\/place\/([^/]+)/i);
    if (!match?.[1]) return null;
    const raw = decodeURIComponent(match[1].replace(/\+/g, " ")).trim();
    if (!raw || /^-?\d+\.\d+,-?\d+\.\d+$/.test(raw)) return null;
    return raw;
  } catch {
    return null;
  }
};

export const expandMapsUrl = async (url) => {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(trimmed, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "RadiatorRepairHub/1.0",
      },
    });
    clearTimeout(timeout);
    return response.url || trimmed;
  } catch {
    return trimmed;
  }
};

const resolveViaMapsToolsApi = async (url, apiKey) => {
  const response = await fetch(
    `https://mapstools.googleapis.com/v1alpha:resolveMapsUrls?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [url] }),
    }
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      `resolveMapsUrls failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  const placeResource = body?.entities?.[0]?.place;
  return stripPlacesPrefix(placeResource);
};

const resolveViaSearchText = async ({ textQuery, coords, apiKey }) => {
  const payload = {
    textQuery,
    maxResultCount: 1,
  };

  if (
    coords &&
    Number.isFinite(coords.latitude) &&
    Number.isFinite(coords.longitude)
  ) {
    payload.locationBias = {
      circle: {
        center: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        radius: 250.0,
      },
    };
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify(payload),
    }
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      `searchText failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return stripPlacesPrefix(body?.places?.[0]?.id) || null;
};

/**
 * Best-effort resolve of a Google Maps / Business URL to a Places place_id.
 * Never throws — returns { placeId, source } and null placeId on failure.
 */
export const resolvePlaceIdFromGoogleMapsUrl = async ({
  url,
  businessName,
} = {}) => {
  const apiKey = getOptionalPlacesApiKey();
  if (!apiKey) {
    return { placeId: null, source: "missing_api_key" };
  }

  const inputUrl = typeof url === "string" ? url.trim() : "";
  if (!inputUrl) {
    return { placeId: null, source: "missing_url" };
  }

  try {
    const fromMapsTools = await resolveViaMapsToolsApi(inputUrl, apiKey);
    if (fromMapsTools) {
      return { placeId: fromMapsTools, source: "resolve_maps_urls" };
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("resolveMapsUrls failed, trying fallbacks:", error.message);
    }
  }

  try {
    const expandedUrl = await expandMapsUrl(inputUrl);
    const extracted = extractPlaceIdFromMapsUrl(expandedUrl);
    if (extracted) {
      return { placeId: extracted, source: "url_extract", expandedUrl };
    }

    const coords = extractCoordsFromMapsUrl(expandedUrl);
    const placeName =
      extractPlaceNameFromMapsUrl(expandedUrl) ||
      (typeof businessName === "string" ? businessName.trim() : "");

    if (!placeName) {
      return { placeId: null, source: "unresolved", expandedUrl };
    }

    const fromSearch = await resolveViaSearchText({
      textQuery: placeName,
      coords,
      apiKey,
    });

    if (fromSearch) {
      return { placeId: fromSearch, source: "search_text", expandedUrl };
    }

    return { placeId: null, source: "unresolved", expandedUrl };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Place ID resolve fallback failed:", error.message);
    }
    return { placeId: null, source: "error", error };
  }
};
