"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";

/** ISO timestamp of when the user dismissed; banner hides until 3 days after this */
const STORAGE_KEY = "pricing-promo-banner-dismissed-at";
const DISMISS_TTL_MS = 3 * 24 * 60 * 60 * 1000;

function isWithinDismissWindow(storedIso) {
  if (!storedIso || typeof storedIso !== "string") return false;
  const dismissedAt = new Date(storedIso).getTime();
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_TTL_MS;
}

const HIDDEN_BANNER_PREFIXES = [
  "/business/",
  "/pricing",
  "/checkout/",
  "/claim/verify/",
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/email-confirmed",
];

function isHiddenBannerPath(pathname) {
  if (!pathname) return false;
  return HIDDEN_BANNER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}

export function usePricingPromoBanner() {
  const pathname = usePathname();
  const { isSignedIn, isLoading: authLoading } = useIsSignedIn();
  const [hasFeaturedListing, setHasFeaturedListing] = useState(false);
  const [ownershipChecked, setOwnershipChecked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isWithinDismissWindow(stored)) {
        setDismissed(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setHasFeaturedListing(false);
      setOwnershipChecked(true);
      return;
    }

    let mountedEffect = true;
    setOwnershipChecked(false);

    fetchOwnedBusinesses().then(({ data, error }) => {
      if (!mountedEffect) return;
      const featured =
        !error &&
        Array.isArray(data) &&
        data.some((business) => Boolean(business?.is_featured));
      setHasFeaturedListing(featured);
      setOwnershipChecked(true);
    });

    return () => {
      mountedEffect = false;
    };
  }, [isSignedIn]);

  const isChecking = authLoading || (isSignedIn && !ownershipChecked);
  const eligible = !isChecking && !(isSignedIn && hasFeaturedListing);
  const visible =
    mounted &&
    eligible &&
    !dismissed &&
    isMdUp &&
    !isHiddenBannerPath(pathname);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setDismissed(true);
  }, []);

  return {
    visible,
    dismiss,
    isChecking,
    isSignedIn,
    hasFeaturedListing,
    ownershipChecked,
  };
}
