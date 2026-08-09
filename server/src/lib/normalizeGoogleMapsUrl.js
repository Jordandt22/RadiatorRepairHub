/**
 * Normalize a Google Maps / Business URL for soft duplicate matching.
 * Keeps the link usable while collapsing trivial differences.
 */
export const normalizeGoogleMapsUrl = (value) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed.toLowerCase();
  }

  parsed.hash = "";

  for (const key of [...parsed.searchParams.keys()]) {
    if (
      key.startsWith("utm_") ||
      key === "fbclid" ||
      key === "gclid" ||
      key === "si"
    ) {
      parsed.searchParams.delete(key);
    }
  }

  const protocol = parsed.protocol.toLowerCase();
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.replace(/\/+$/, "") || "";
  const search = parsed.searchParams.toString();

  return `${protocol}//${host}${path}${search ? `?${search}` : ""}`;
};
