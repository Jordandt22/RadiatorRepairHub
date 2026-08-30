"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import FeaturedBadge from "@/components/businesses/FeaturedBadge";
import { buttonVariants } from "@/components/ui/button";

export default function FeaturedUpgradeCard() {
  const posthog = usePostHog();

  const captureCta = (cta) => {
    posthog?.capture("featured_cta_clicked", {
      source: "featured_page",
      cta,
    });
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-dashed border-amber-400/70 bg-card">
      <div className="relative h-48 w-full shrink-0 bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <Star
            className="size-14 text-amber-500/80"
            fill="currentColor"
            aria-hidden="true"
          />
        </div>
        <FeaturedBadge
          size="md"
          className="absolute top-3 left-3 z-10"
          label="Open slot"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
          Upgrade your listing to Featured
        </h3>
        <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
          <Link
            href="/how-to-claim"
            className="font-medium text-interactive underline hover:text-primary"
            prefetch={false}
            onClick={() => captureCta("how_to_claim")}
          >
            Claim your shop
          </Link>
          , then upgrade for the Featured badge, priority placement in search, extra
          shop photos, and a featured card on this page.
        </p>
        <div className="mt-auto space-y-2">
          <Link
            href="/pricing"
            className={buttonVariants({
              className: "w-full rounded-full",
            })}
            prefetch={false}
            onClick={() => captureCta("get_featured")}
          >
            Get Featured
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/how-to-claim"
            className={buttonVariants({
              variant: "outline",
              className: "w-full rounded-full",
            })}
            prefetch={false}
            onClick={() => captureCta("how_to_claim")}
          >
            How to claim
          </Link>
        </div>
      </div>
    </article>
  );
}
