const MAX_WIDTH_PX = 800;
const MAX_HEIGHT_PX = 544;

export function getPlacesApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing GOOGLE_PLACES_API_KEY. Places API (New) must be enabled for that key."
    );
  }
  return key;
}

export async function fetchPlacePhotos(placeId, apiKey) {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const response = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "photos",
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      `Place Details failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return Array.isArray(body.photos) ? body.photos : [];
}

export async function fetchPhotoMediaBuffer(photoName, apiKey) {
  const mediaUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  mediaUrl.searchParams.set("maxWidthPx", String(MAX_WIDTH_PX));
  mediaUrl.searchParams.set("maxHeightPx", String(MAX_HEIGHT_PX));
  mediaUrl.searchParams.set("key", apiKey);

  const response = await fetch(mediaUrl, { redirect: "follow" });

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || errBody?.message || "";
    } catch {
      detail = "";
    }
    throw new Error(detail || `Place Photos media failed (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}
