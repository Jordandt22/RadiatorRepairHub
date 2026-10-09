"use client";

import { usePathname } from "next/navigation";

const EXACT_PATHS = new Set([
  "/pricing",
  "/how-to-claim",
  "/get-listed",
  "/contact",
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/email-confirmed",
  "/account-confirmed",
  "/checkout/success",
  "/checkout/cancel",
  "/email/unsubscribe",
  "/privacy",
  "/terms",
  "/maintenance",
]);

const PREFIXES = ["/dashboard", "/settings", "/claim/verify"];

function normalizePath(pathname) {
  if (!pathname) return "";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function shouldBlockJourneyAds(pathname) {
  const path = normalizePath(pathname);
  if (EXACT_PATHS.has(path)) return true;
  return PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export function isBusinessPath(pathname) {
  const path = normalizePath(pathname);
  return path === "/business" || path.startsWith("/business/");
}

/** Home allows the sticky bar, so Journey still will not rescan after a client navigation. */
export function shouldReloadJourneyOnLeave(pathname) {
  return normalizePath(pathname) === "/" || shouldBlockJourneyAds(pathname);
}

export default function JourneyAdBlock() {
  const pathname = usePathname();
  const path = normalizePath(pathname);

  if (path === "/") {
    return (
      <div
        id="ad-management-config-settings"
        data-blocklist-content-desktop="1"
        data-blocklist-content-mobile="1"
        data-blocklist-universal-player-desktop="1"
        data-blocklist-universal-player-mobile="1"
        data-blocklist-sidebar-btf="1"
        data-blocklist-recipe="1"
      />
    );
  }

  if (isBusinessPath(path)) {
    return (
      <div
        id="ad-management-config-settings"
        data-blocklist-adhesion-desktop="1"
        data-blocklist-adhesion-tablet="1"
        data-blocklist-adhesion-mobile="1"
        data-blocklist-universal-player-desktop="1"
        data-blocklist-universal-player-mobile="1"
      />
    );
  }

  if (!shouldBlockJourneyAds(pathname)) {
    return (
      <div
        id="ad-management-config-settings"
        data-blocklist-universal-player-mobile="1"
      />
    );
  }

  return <div id="ad-management-config-settings" data-blocklist-all="1" />;
}
