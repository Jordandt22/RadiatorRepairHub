/**
 * Site registry for the internal admin client.
 *
 * Each site is a standalone deployment (own API, own Supabase project, own
 * admin password). The admin UI talks to exactly one site at a time; the
 * active site decides which API every `fetchApi` call is sent to.
 *
 * `process.env.NEXT_PUBLIC_*` values are inlined at build time, so each one
 * must be referenced statically.
 */

const isDev = process.env.NODE_ENV === "development";

const DEFAULT_API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1";

function trimTrailingSlash(value) {
  return typeof value === "string" ? value.replace(/\/+$/, "") : value;
}

export const SITES = [
  {
    id: "rrh",
    name: "RadiatorRepairHub",
    shortName: "RRH",
    tagline: "Radiator & cooling shops",
    defaultKeyword: "radiator repair",
    apiUrl: trimTrailingSlash(
      process.env.NEXT_PUBLIC_API_URL ||
        (isDev ? "http://localhost:8000" : "")
    ),
    apiVersion: DEFAULT_API_VERSION,
    webUrl: trimTrailingSlash(
      process.env.NEXT_PUBLIC_WEB_URL ||
        (isDev ? "http://localhost:3000" : "https://radiatorrepairhub.com")
    ),
    cfImagesBaseUrl: trimTrailingSlash(
      process.env.NEXT_PUBLIC_CF_IMAGES_BASE_URL ||
        "https://images.radiatorrepairhub.com/images"
    ),
  },
  {
    id: "drh",
    name: "DieselRepairHub",
    shortName: "DRH",
    tagline: "Diesel & heavy duty shops",
    defaultKeyword: "diesel repair",
    apiUrl: trimTrailingSlash(
      process.env.NEXT_PUBLIC_DIESEL_API_URL ||
        (isDev ? "http://localhost:8001" : "")
    ),
    apiVersion: process.env.NEXT_PUBLIC_DIESEL_API_VERSION || DEFAULT_API_VERSION,
    webUrl: trimTrailingSlash(
      process.env.NEXT_PUBLIC_DIESEL_WEB_URL ||
        (isDev ? "http://localhost:3002" : "https://dieselrepairhub.com")
    ),
    cfImagesBaseUrl: trimTrailingSlash(
      process.env.NEXT_PUBLIC_DIESEL_CF_IMAGES_BASE_URL ||
        "https://images.dieselrepairhub.com/images"
    ),
  },
];

export const DEFAULT_SITE_ID = "rrh";

export const ACTIVE_SITE_STORAGE_KEY = "admin_active_site";

/** Token storage key for a site. Kept stable so sessions survive reloads. */
export const siteTokenKey = (siteId) => `admin_token_${siteId}`;

export function getSiteById(siteId) {
  return SITES.find((site) => site.id === siteId) || null;
}

export function getDefaultSite() {
  return getSiteById(DEFAULT_SITE_ID) || SITES[0];
}

/**
 * Active site id from localStorage. Falls back to the default site on the
 * server and whenever the stored value is missing or unknown.
 */
export function readActiveSiteId() {
  if (typeof window === "undefined") return DEFAULT_SITE_ID;

  try {
    const stored = window.localStorage.getItem(ACTIVE_SITE_STORAGE_KEY);
    return getSiteById(stored) ? stored : DEFAULT_SITE_ID;
  } catch {
    return DEFAULT_SITE_ID;
  }
}

export function writeActiveSiteId(siteId) {
  if (typeof window === "undefined") return;
  if (!getSiteById(siteId)) return;

  try {
    window.localStorage.setItem(ACTIVE_SITE_STORAGE_KEY, siteId);
  } catch {
    // ignore quota / private mode
  }
}

/** Active site config. Used by `fetchApi` outside of React. */
export function getActiveSite() {
  return getSiteById(readActiveSiteId()) || getDefaultSite();
}

export function getSiteApiUri(site) {
  if (!site?.apiUrl) return null;
  return `${site.apiUrl}/v${site.apiVersion || DEFAULT_API_VERSION}/api`;
}
