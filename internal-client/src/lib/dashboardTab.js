const TAB_CHANGE_EVENT = "dashboard-tabchange";

export function getTabFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("tab");
}

export function replaceTab(tab, pathname) {
  const path =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/dashboard");
  const url = `${path}?tab=${tab}`;
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(TAB_CHANGE_EVENT));
}

/** @deprecated Prefer replaceTab — kept for callers that hardcode /dashboard */
export function replaceDashboardTab(tab) {
  replaceTab(tab, "/dashboard");
}

export function subscribeToDashboardTab(onChange) {
  const handler = () => onChange(getTabFromLocation());
  window.addEventListener("popstate", handler);
  window.addEventListener(TAB_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("popstate", handler);
    window.removeEventListener(TAB_CHANGE_EVENT, handler);
  };
}
