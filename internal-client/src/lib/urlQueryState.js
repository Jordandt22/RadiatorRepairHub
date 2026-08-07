const QUERY_CHANGE_EVENT = "rrh-querychange";

export function getSearchParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/**
 * Merge patch into the current query string via replaceState.
 * null / undefined / "" values remove the key.
 */
export function setSearchParams(patch, { pathname } = {}) {
  if (typeof window === "undefined") return;

  const params = getSearchParams();
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (value == null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  const path = pathname ?? window.location.pathname;
  const qs = params.toString();
  const url = qs ? `${path}?${qs}` : path;
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(QUERY_CHANGE_EVENT));
}

export function subscribeToSearchParams(onChange) {
  const handler = () => onChange(getSearchParams());
  window.addEventListener("popstate", handler);
  window.addEventListener(QUERY_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("popstate", handler);
    window.removeEventListener(QUERY_CHANGE_EVENT, handler);
  };
}

export function parsePageParam(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

export function findOptionById(items, id) {
  if (id == null || id === "") return null;
  return items.find((item) => item.id === id) ?? null;
}

/** Ensure a query key exists without wiping other params. */
export function ensureQueryParam(key, value, pathname) {
  if (typeof window === "undefined") return;
  const params = getSearchParams();
  if (params.get(key)) return;
  setSearchParams({ [key]: value }, { pathname });
}
