export const BUSINESS_EXPORT_FIELDS = Object.freeze([
  { id: "title", label: "Title", defaultSelected: true },
  { id: "phone", label: "Phone", defaultSelected: true },
  { id: "email", label: "Email", defaultSelected: true },
  { id: "website", label: "Website", defaultSelected: true },
  { id: "score", label: "Score", defaultSelected: true },
  { id: "reviews", label: "Reviews", defaultSelected: true },
  { id: "address", label: "Address", defaultSelected: true },
  { id: "state", label: "State", defaultSelected: true },
  { id: "city", label: "City", defaultSelected: true },
  { id: "postal_code", label: "Postal code", defaultSelected: true },
  {
    id: "google_business_link",
    label: "Google business link",
    defaultSelected: true,
  },
  { id: "site_page_link", label: "Site page link", defaultSelected: true },
  { id: "id", label: "ID", defaultSelected: false },
  { id: "slug", label: "Slug", defaultSelected: false },
  { id: "claimed", label: "Claimed", defaultSelected: false },
  { id: "featured", label: "Featured", defaultSelected: false },
  { id: "category", label: "Category", defaultSelected: false },
  { id: "description", label: "Description", defaultSelected: false },
  { id: "lat", label: "Latitude", defaultSelected: false },
  { id: "lng", label: "Longitude", defaultSelected: false },
  { id: "email_status", label: "Email status", defaultSelected: false },
  { id: "phone_status", label: "Phone status", defaultSelected: false },
  { id: "created_at", label: "Created at", defaultSelected: false },
  { id: "last_edited_at", label: "Last edited at", defaultSelected: false },
  { id: "impressions", label: "Impressions", defaultSelected: false, stats: true },
  {
    id: "listing_clicks",
    label: "Listing clicks",
    defaultSelected: false,
    stats: true,
  },
  { id: "page_views", label: "Page views", defaultSelected: false, stats: true },
  { id: "ctr", label: "CTR", defaultSelected: false, stats: true },
  {
    id: "phone_clicks",
    label: "Phone clicks",
    defaultSelected: false,
    stats: true,
  },
  {
    id: "directions_clicks",
    label: "Directions clicks",
    defaultSelected: false,
    stats: true,
  },
  {
    id: "website_clicks",
    label: "Website clicks",
    defaultSelected: false,
    stats: true,
  },
  {
    id: "email_clicks",
    label: "Email clicks",
    defaultSelected: false,
    stats: true,
  },
]);

export const BUSINESS_EXPORT_STATS_FIELD_IDS = Object.freeze(
  BUSINESS_EXPORT_FIELDS.filter((field) => field.stats).map((field) => field.id),
);

export const BUSINESS_EXPORT_STATS_RANGES = Object.freeze([
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All" },
]);

export const DEFAULT_BUSINESS_EXPORT_STATS_RANGE = "30d";

export function getDefaultBusinessExportFields() {
  return BUSINESS_EXPORT_FIELDS.filter((field) => field.defaultSelected).map(
    (field) => field.id,
  );
}

export function fieldsIncludeStats(fields = []) {
  return fields.some((id) => BUSINESS_EXPORT_STATS_FIELD_IDS.includes(id));
}

function slugifyFilenamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build a default CSV filename from the table context and active filters.
 */
export function buildBusinessExportFilename({
  source = "businesses",
  claimed = null,
  featured = null,
  recent = null,
  websiteFilter = null,
  emailFilter = null,
  scoreTier = null,
  reviewsTier = null,
  stateCode = null,
  citySlug = null,
  postalCode = null,
  q = null,
  statsRange = null,
  includeStats = false,
} = {}) {
  const parts = [source === "websites" ? "businesses" : "businesses"];

  if (recent) parts.push("recent");
  else if (featured) parts.push("featured");
  else if (claimed) parts.push("claimed");

  if (stateCode) parts.push(slugifyFilenamePart(stateCode));
  if (citySlug) parts.push(slugifyFilenamePart(citySlug));
  if (postalCode) parts.push(slugifyFilenamePart(postalCode));

  if (websiteFilter === "none") parts.push("no-website");
  else if (websiteFilter === "has") parts.push("has-website");

  if (emailFilter === "none") parts.push("no-email");
  else if (emailFilter === "has") parts.push("has-email");

  if (scoreTier) parts.push(`score-${slugifyFilenamePart(scoreTier)}`);
  if (reviewsTier) parts.push(`reviews-${slugifyFilenamePart(reviewsTier)}`);

  const search = slugifyFilenamePart(q);
  if (search) parts.push(`q-${search.slice(0, 40)}`);

  if (includeStats && statsRange) {
    parts.push(`stats-${statsRange}`);
  }

  return `${parts.filter(Boolean).join("-") || "businesses"}.csv`;
}
