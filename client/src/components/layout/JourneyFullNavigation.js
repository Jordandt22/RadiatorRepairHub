"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { shouldBlockJourneyAds } from "@/components/layout/JourneyAdBlock";

function shouldForceFullLoad(anchor) {
  if (!anchor) return false;
  if (anchor.target === "_blank") return false;
  if (anchor.hasAttribute("download")) return false;

  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#")) return false;

  let url;
  try {
    url = new URL(anchor.href, window.location.origin);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;
  if (shouldBlockJourneyAds(url.pathname)) return false;
  return url.href;
}

/**
 * Journey scans the document once. A client navigation away from a blocked
 * page never runs that scan, so those clicks become a full page load.
 */
export default function JourneyFullNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldBlockJourneyAds(pathname)) return;

    function onClick(event) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      const href = shouldForceFullLoad(anchor);
      if (!href) return;

      event.preventDefault();
      window.location.assign(href);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
