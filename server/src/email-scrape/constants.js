export const EMAIL_SCRAPE_BATCH_SIZE = 20;

/** Stop selecting businesses after this many scrape attempts. */
export const MAX_EMAIL_SCRAPED_ATTEMPTS = 2;

/**
 * 20 businesses * 6 pages * 10s timeout is ~20 min worst case.
 * Keep the BullMQ lock above that so a slow batch is not marked stalled.
 */
export const EMAIL_SCRAPE_JOB_LOCK_DURATION_MS = 2_400_000;
export const EMAIL_SCRAPE_STALLED_INTERVAL_MS = 600_000;

/** Re-enqueue running batches whose claim is older than the lock. */
export const EMAIL_SCRAPE_ORPHAN_AFTER_MS = EMAIL_SCRAPE_JOB_LOCK_DURATION_MS;

export const FETCH_TIMEOUT_MS = 10_000;
export const DELAY_MIN_MS = 400;
export const DELAY_MAX_MS = 600;
export const MIN_BODY_LENGTH = 200;

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

export const CONTACT_PATHS = [
  "/contact",
  "/contact-us",
  "/about",
  "/about-us",
];

export const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "ao_auto_show",
  "ao_client_key",
  "cmp",
  "stnum",
]);

export const PLATFORM_HOST_PATTERNS = [
  /facebook\.com$/i,
  /fb\.com$/i,
  /instagram\.com$/i,
  /sites\.google\.com$/i,
  /maps\.app\.goo\.gl$/i,
  /goo\.gl$/i,
  /linktr\.ee$/i,
  /yelp\.com$/i,
  /twitter\.com$/i,
  /x\.com$/i,
  /linkedin\.com$/i,
  /tiktok\.com$/i,
  /youtube\.com$/i,
  /youtu\.be$/i,
];

export const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/gi;

export const MAILTO_REGEX =
  /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
