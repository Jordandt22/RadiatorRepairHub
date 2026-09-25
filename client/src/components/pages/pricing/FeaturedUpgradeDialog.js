"use client";

import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FeaturedUpgradeCtaLabel from "@/components/pages/pricing/FeaturedUpgradeCtaLabel";
import { featuredUpgradeButtonClass } from "@/components/pages/pricing/featuredUpgradeStyles";
import { FEATURED_YEARLY_PRICE_WITH_INTERVAL } from "@/lib/featuredPricing";
import { cn } from "@/lib/utils";

function FeaturedCheckoutLegalNote() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      By starting Featured checkout, you agree to our{" "}
      <Link
        href="/terms"
        className="font-medium text-interactive underline hover:text-primary"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        className="font-medium text-interactive underline hover:text-primary"
      >
        Privacy Policy
      </Link>
      . Payment is processed by Stripe.
    </p>
  );
}

/**
 * Dialog for picking a claimed business when upgrading to Featured.
 * Also used for empty / already-featured messaging.
 */
export default function FeaturedUpgradeDialog({
  open,
  onOpenChange,
  mode = "select",
  eligible = [],
  selectedId = "",
  onSelectedIdChange,
  onConfirm,
  isSubmitting = false,
  hasAnyBusinesses = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Upgrade to Featured</DialogTitle>
              <DialogDescription>
                Choose which claimed listing to upgrade for{" "}
                {FEATURED_YEARLY_PRICE_WITH_INTERVAL}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <label
                htmlFor="featured-upgrade-business"
                className="text-sm font-medium text-foreground"
              >
                Your claimed businesses
              </label>
              <select
                id="featured-upgrade-business"
                value={selectedId}
                onChange={(e) => onSelectedIdChange?.(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {eligible.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.title}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-muted-foreground">
              Cancel anytime · Tax may be added at checkout
            </p>
            <FeaturedCheckoutLegalNote />

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => onOpenChange?.(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={cn(featuredUpgradeButtonClass)}
                disabled={!selectedId || isSubmitting}
                aria-busy={isSubmitting}
                onClick={onConfirm}
              >
                <FeaturedUpgradeCtaLabel
                  isSubmitting={isSubmitting}
                  readyLabel="Continue to checkout"
                />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {hasAnyBusinesses
                  ? "Already Featured"
                  : "Claim a listing first"}
              </DialogTitle>
              <DialogDescription>
                {hasAnyBusinesses
                  ? "All of your listings are already Featured."
                  : "You don't have a claimed listing yet. Claim a business first, then come back to upgrade."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-2">
              <Link
                href="/how-to-claim"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full"
                )}
              >
                <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
                How to claim
              </Link>
              {hasAnyBusinesses ? (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants(), "rounded-full")}
                >
                  My businesses
                </Link>
              ) : null}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
