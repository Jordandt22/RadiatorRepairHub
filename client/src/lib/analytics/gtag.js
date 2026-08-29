const BUSINESS_STAT_GTAG_EVENTS = new Set(["phone_click", "listing_click"]);

function compactParams(params = {}) {
  const payload = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    payload[key] = value;
  }
  return payload;
}

export function trackGtagEvent(eventName, params) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  if (!eventName) return;

  window.gtag("event", eventName, compactParams(params));
}

export function trackGtagBusinessStat({
  event,
  businessId,
  source,
  position,
} = {}) {
  if (!BUSINESS_STAT_GTAG_EVENTS.has(event)) return;

  trackGtagEvent(event, {
    business_id: businessId,
    listing_source: source,
    listing_position: typeof position === "number" ? position : undefined,
  });
}
