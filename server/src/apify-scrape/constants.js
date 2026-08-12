export const APIFY_SCRAPE_QUEUE_NAME = "apify-scrape-city";

export const DEFAULT_SEARCH_KEYWORD = "radiator repair";

export const MIN_MAX_PLACES = 10;
export const MAX_MAX_PLACES = 200;
export const DEFAULT_MAX_PLACES = 100;

export const MAX_SCRAPE_CITIES = 50;

/** Apify actor runs take minutes; give the run and the BullMQ lock plenty of room. */
export const APIFY_RUN_TIMEOUT_SECS = 900;
export const APIFY_JOB_LOCK_DURATION_MS = 900_000;
