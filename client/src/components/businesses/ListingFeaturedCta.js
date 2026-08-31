"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, X } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { buttonVariants } from "@/components/ui/button";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import {
  dismissFeaturedCta,
  isFeaturedCtaDismissed,
} from "@/lib/featuredListingCtaStorage";

function findOwnedBusiness(businesses, businessId) {
  if (!businessId || !Array.isArray(businesses)) return null;
  return (
    businesses.find((business) => String(business?.id) === String(businessId)) ??
    null
  );
}

export default function ListingFeaturedCta({
  businessId,
  businessSlug,
  businessName,
}) {
  const posthog = usePostHog();
  const { isSignedIn, isLoading: authLoading } = useIsSignedIn();
  const [mounted, setMounted] = useState(false);
  const [ownershipChecked, setOwnershipChecked] = useState(false);
  const [ownedBusiness, setOwnedBusiness] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setOwnedBusiness(null);
      setOwnershipChecked(true);
      return;
    }

    let active = true;
    setOwnershipChecked(false);

    fetchOwnedBusinesses().then(({ data, error }) => {
      if (!active) return;
      if (error || !Array.isArray(data)) {
        setOwnedBusiness(null);
      } else {
        setOwnedBusiness(findOwnedBusiness(data, businessId));
      }
      setOwnershipChecked(true);
    });

    return () => {
      active = false;
    };
  }, [isSignedIn, businessId]);

  useEffect(() => {
    if (
      !mounted ||
      authLoading ||
      !ownershipChecked ||
      !ownedBusiness ||
      ownedBusiness.is_featured
    ) {
      setVisible(false);
      return;
    }

    setVisible(!isFeaturedCtaDismissed(businessId, "listing"));
  }, [
    mounted,
    authLoading,
    ownershipChecked,
    ownedBusiness,
    businessId,
  ]);

  if (!visible || !businessId) return null;

  const handleDismiss = () => {
    dismissFeaturedCta(businessId, "listing");
    setVisible(false);
    posthog?.capture("featured_cta_dismissed", {
      source: "listing_page",
      cta: "get_featured",
      snooze_days: 7,
      business_id: businessId,
      business_slug: businessSlug || undefined,
      business_name: businessName || undefined,
    });
  };

  return (
    <div
      role="region"
      aria-label="Featured listing upgrade"
      className="mb-4 flex flex-col gap-5 rounded-lg border border-amber-400/50 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/25 dark:bg-amber-500/10 md:mb-6"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Star className="size-5 fill-current" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading font-semibold text-foreground">
            Get Featured to Increase Your Visibility
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Higher priority in search results, a Featured badge, and a spot on the Featured page.
          </p>
        </div>
      </div>
      <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto sm:gap-1">
        <Link
          href={`/pricing?business=${encodeURIComponent(businessId)}`}
          className={buttonVariants({
            className: "w-1/2 justify-center sm:w-auto sm:shrink-0",
          })}
          prefetch={false}
          onClick={() =>
            posthog?.capture("featured_cta_clicked", {
              source: "listing_page",
              cta: "get_featured",
              business_id: businessId,
              business_slug: businessSlug || undefined,
              business_name: businessName || undefined,
            })
          }
        >
          Get Featured
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex w-1/2 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/80 sm:hidden"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="hidden size-8 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground sm:inline-flex"
          aria-label="Hide Featured offer for one week"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
