import { getSearchParams, setSearchParams } from "./urlQueryState";

const TAB_CHANGE_EVENT = "dashboard-tabchange";

export function getTabFromLocation() {
  if (typeof window === "undefined") return null;
  return getSearchParams().get("tab");
}

export function replaceTab(tab, pathname) {
  const path =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/contact-form");
  setSearchParams({ tab }, { pathname: path });
  window.dispatchEvent(new Event(TAB_CHANGE_EVENT));
}

/** @deprecated Prefer replaceTab — kept for callers that hardcode /contact-form */
export function replaceDashboardTab(tab) {
  replaceTab(tab, "/contact-form");
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
