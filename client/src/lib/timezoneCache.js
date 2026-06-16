const timezoneCache = new Map();

function getCacheKey(latitude, longitude) {
  return `${Number(latitude).toFixed(2)},${Number(longitude).toFixed(2)}`;
}

export async function resolveTimezone(latitude, longitude) {
  if (latitude == null || longitude == null) return null;

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const cacheKey = getCacheKey(lat, lng);
  if (timezoneCache.has(cacheKey)) {
    return timezoneCache.get(cacheKey);
  }

  try {
    const response = await fetch(`/api/timezone?lat=${lat}&lng=${lng}`);
    if (!response.ok) return null;

    const { timezone } = await response.json();
    timezoneCache.set(cacheKey, timezone ?? null);
    return timezone ?? null;
  } catch {
    return null;
  }
}
