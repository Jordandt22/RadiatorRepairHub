const PLACEHOLDER_SLUGS = new Set(["null", "undefined"]);

export const BUSINESS_NOT_FOUND_ERROR = Object.freeze({
  code: "PGRST116",
  message: "Business not found",
});

/** Rejects missing values and JS stringified null/undefined path segments. */
export function isUsableBusinessSlug(slug) {
  if (typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed) return false;
  return !PLACEHOLDER_SLUGS.has(trimmed.toLowerCase());
}
