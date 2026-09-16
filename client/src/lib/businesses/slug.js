const PLACEHOLDER_SLUGS = new Set(["null", "undefined"]);

/** Rejects missing values and JS stringified null/undefined path segments. */
export function isUsableBusinessSlug(slug) {
  if (typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed) return false;
  return !PLACEHOLDER_SLUGS.has(trimmed.toLowerCase());
}

export function getBusinessPath(slug) {
  if (!isUsableBusinessSlug(slug)) return null;
  return `/business/${String(slug).trim()}`;
}
