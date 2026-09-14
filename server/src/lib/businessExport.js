import { getWebBaseUrl } from "./constants/messages.js";
import { getGoogleMapsPlaceUrl } from "./googleMaps.js";
import {
  businessStatDateKey,
  dateKeyOffset,
} from "./businessStatsDate.js";

function buildExportSitePageLink(slug) {
  const fromEnv =
    typeof process.env.WEB_URL === "string"
      ? process.env.WEB_URL.trim().replace(/\/+$/, "")
      : "";
  const base = fromEnv || getWebBaseUrl();
  if (!slug) return base;
  return `${base}/business/${slug}`;
}

export const BUSINESS_EXPORT_FIELD_IDS = Object.freeze([
  "title",
  "phone",
  "email",
  "website",
  "score",
  "reviews",
  "address",
  "state",
  "city",
  "postal_code",
  "google_business_link",
  "site_page_link",
  "id",
  "slug",
  "claimed",
  "featured",
  "category",
  "description",
  "lat",
  "lng",
  "email_status",
  "phone_status",
  "created_at",
  "last_edited_at",
  "impressions",
  "listing_clicks",
  "page_views",
  "ctr",
  "phone_clicks",
  "directions_clicks",
  "website_clicks",
  "email_clicks",
]);

export const BUSINESS_EXPORT_STATS_FIELD_IDS = Object.freeze([
  "impressions",
  "listing_clicks",
  "page_views",
  "ctr",
  "phone_clicks",
  "directions_clicks",
  "website_clicks",
  "email_clicks",
]);

export const BUSINESS_EXPORT_STATS_RANGES = Object.freeze([
  "today",
  "7d",
  "30d",
  "all",
]);

const FIELD_HEADERS = Object.freeze({
  title: "Title",
  phone: "Phone",
  email: "Email",
  website: "Website",
  score: "Score",
  reviews: "Reviews",
  address: "Address",
  state: "State",
  city: "City",
  postal_code: "Postal code",
  google_business_link: "Google business link",
  site_page_link: "Site page link",
  id: "ID",
  slug: "Slug",
  claimed: "Claimed",
  featured: "Featured",
  category: "Category",
  description: "Description",
  lat: "Latitude",
  lng: "Longitude",
  email_status: "Email status",
  phone_status: "Phone status",
  created_at: "Created at",
  last_edited_at: "Last edited at",
  impressions: "Impressions",
  listing_clicks: "Listing clicks",
  page_views: "Page views",
  ctr: "CTR",
  phone_clicks: "Phone clicks",
  directions_clicks: "Directions clicks",
  website_clicks: "Website clicks",
  email_clicks: "Email clicks",
});

export function fieldsIncludeStats(fields = []) {
  return fields.some((id) => BUSINESS_EXPORT_STATS_FIELD_IDS.includes(id));
}

export function resolveExportStatsDateRange(statsRange) {
  if (!statsRange || statsRange === "all") {
    return { startDate: null, endDate: null };
  }

  const today = businessStatDateKey();
  if (statsRange === "today") {
    return { startDate: today, endDate: today };
  }
  if (statsRange === "7d") {
    return { startDate: dateKeyOffset(today, -6), endDate: today };
  }
  if (statsRange === "30d") {
    return { startDate: dateKeyOffset(today, -29), endDate: today };
  }
  return { startDate: null, endDate: null };
}

export function sanitizeExportFilename(filename, fallback = "businesses.csv") {
  const raw = typeof filename === "string" ? filename.trim() : "";
  const base = (raw || fallback)
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const withExt = /\.csv$/i.test(base) ? base : `${base || "businesses"}.csv`;
  return withExt.slice(0, 180);
}

function csvEscape(value) {
  if (value == null) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatBool(value) {
  if (value == null) return "";
  return value ? "true" : "false";
}

function getFieldValue(fieldId, business, statsById) {
  const stats = statsById?.get(business.id) ?? null;

  switch (fieldId) {
    case "title":
      return business.title ?? "";
    case "phone":
      return business.phone ?? "";
    case "email":
      return business.email ?? "";
    case "website":
      return business.website ?? "";
    case "score":
      return business.total_score ?? "";
    case "reviews":
      return business.reviews_count ?? "";
    case "address":
      return business.address ?? "";
    case "state":
      return business.state?.code ?? business.state?.name ?? "";
    case "city":
      return business.city?.name ?? "";
    case "postal_code":
      return business.postal_code?.code ?? "";
    case "google_business_link":
      return getGoogleMapsPlaceUrl(business) ?? "";
    case "site_page_link":
      return business.slug ? buildExportSitePageLink(business.slug) : "";
    case "id":
      return business.id ?? "";
    case "slug":
      return business.slug ?? "";
    case "claimed":
      return formatBool(business.is_claimed);
    case "featured":
      return formatBool(business.is_featured);
    case "category":
      return business.primary_category?.name ?? "";
    case "description":
      return business.description ?? "";
    case "lat":
      return business.latitude ?? "";
    case "lng":
      return business.longitude ?? "";
    case "email_status":
      return business.email_status ?? "";
    case "phone_status":
      return business.phone_status ?? "";
    case "created_at":
      return business.created_at ?? "";
    case "last_edited_at":
      return business.last_edited_at ?? "";
    case "impressions":
      return stats?.impressions ?? 0;
    case "listing_clicks":
      return stats?.listing_clicks ?? 0;
    case "page_views":
      return stats?.page_views ?? 0;
    case "ctr":
      return stats?.ctr ?? "";
    case "phone_clicks":
      return stats?.phone_clicks ?? 0;
    case "directions_clicks":
      return stats?.directions_clicks ?? 0;
    case "website_clicks":
      return stats?.website_clicks ?? 0;
    case "email_clicks":
      return stats?.email_clicks ?? 0;
    default:
      return "";
  }
}

export function buildBusinessExportCsv(businesses, fields, statsById = null) {
  const requested = new Set(
    (fields ?? []).filter((id) => BUSINESS_EXPORT_FIELD_IDS.includes(id))
  );
  const safeFields = BUSINESS_EXPORT_FIELD_IDS.filter((id) =>
    requested.has(id)
  );
  const header = safeFields.map((id) => csvEscape(FIELD_HEADERS[id] || id));
  const lines = [header.join(",")];

  for (const business of businesses ?? []) {
    const row = safeFields.map((id) =>
      csvEscape(getFieldValue(id, business, statsById))
    );
    lines.push(row.join(","));
  }

  return `${lines.join("\r\n")}\r\n`;
}

export function normalizeExportStatsRows(rows = []) {
  const map = new Map();
  for (const row of rows) {
    if (!row?.business_id) continue;
    const impressions = Number(row.impressions || 0);
    const listingClicks = Number(row.listing_clicks || 0);
    map.set(row.business_id, {
      impressions,
      listing_clicks: listingClicks,
      page_views: Number(row.page_views || 0),
      phone_clicks: Number(row.phone_clicks || 0),
      directions_clicks: Number(row.directions_clicks || 0),
      website_clicks: Number(row.website_clicks || 0),
      email_clicks: Number(row.email_clicks || 0),
      ctr:
        impressions > 0
          ? Math.round((listingClicks / impressions) * 1000) / 10
          : null,
    });
  }
  return map;
}
