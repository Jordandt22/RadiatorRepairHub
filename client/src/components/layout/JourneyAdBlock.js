"use client";

import { usePathname } from "next/navigation";

const EXACT_PATHS = new Set([
  "/",
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

export default function JourneyAdBlock() {
  const pathname = usePathname();
  if (!shouldBlockJourneyAds(pathname)) return null;

  return <div id="ad-management-config-settings" data-blocklist-all="1" />;
}
