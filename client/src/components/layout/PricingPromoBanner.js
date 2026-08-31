"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { usePricingPromoBanner } from "@/hooks/usePricingPromoBanner";

export default function PricingPromoBanner() {
  const { visible, dismiss } = usePricingPromoBanner();

  if (!visible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Featured listing promotion"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-foreground/10 bg-primary text-primary-foreground shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:gap-6 sm:px-6 lg:px-8">
        <p className="min-w-0 flex-1 text-sm font-medium">
          Are you a business owner? Get featured to increase your visibility and phone calls!
        </p>
        <Link
          href="/pricing"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1.5 text-sm font-semibold transition-interactive hover:bg-primary-foreground/20"
        >
          Get Featured
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary-foreground/80 bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/40"
          aria-label="Dismiss banner"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
