"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, LayoutDashboard, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/contexts/ToastProvider";
import { claimBusiness } from "@/lib/api/businesses";
import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { isEmailUnderReview, EMAIL_UNDER_REVIEW_MESSAGE } from "@/lib/emailStatus";
import { usePostHog } from "posthog-js/react";

function ClaimStatusLabel({ children, reason, showHowToClaim = false }) {
  return (
    <div className="mt-3 text-center">
      <p className="text-sm font-medium text-muted-foreground">{children}</p>
      {reason ? (
        <p className="mt-0.5 text-xs text-muted-foreground/70">{reason}</p>
      ) : null}
      {showHowToClaim ? (
        <Link
          href="/how-to-claim"
          className="mt-1.5 inline-block text-xs text-interactive hover:underline"
        >
          Why can&apos;t I claim?
        </Link>
      ) : null}
    </div>
  );
}

function ClaimBusinessButtonContent({
  businessId,
  businessSlug,
  businessName,
  email,
}) {
  const { showCustomError } = useToast();
  const posthog = usePostHog();
  const { isSignedIn } = useIsSignedIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const capture = (event, props = {}) => {
    posthog?.capture(event, {
      business_id: businessId || undefined,
      business_slug: businessSlug || undefined,
      business_name: businessName || undefined,
      signed_in: Boolean(isSignedIn),
      source: "listing",
      ...props,
    });
  };

  const handleClaim = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    capture("claim_started");
    try {
      const { error } = await claimBusiness(businessId);

      if (error) {
        capture("claim_failed", {
          stage: "start",
          error_code:
            typeof error.code === "string" ? error.code : undefined,
          error_message:
            typeof error.message === "string" ? error.message : undefined,
        });
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to start the claim process. Please try again."
        );
        return;
      }

      capture("claim_code_sent");
      setSuccessOpen(true);
    } catch {
      capture("claim_failed", { stage: "start" });
      showCustomError("Unable to start the claim process. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full rounded-full gap-2 text-sm font-medium border border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
        disabled={isSubmitting}
        onClick={handleClaim}
      >
        <BadgeCheck className="size-4" />
        {isSubmitting ? "Sending..." : "Claim"}
      </Button>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check your inbox</DialogTitle>
            <DialogDescription>
              We&apos;ve sent a verification code to{" "}
              <strong className="font-semibold text-foreground">
                {email || "the email on file for this business"}
              </strong>. Check your inbox and click the link to
              complete your claim.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button type="button" className="w-full sm:w-auto px-8" />}
            >
              Got it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ClaimedBusinessStatus({
  businessId,
  lastEditedAt = null,
  isFeatured = false,
}) {
  const { showOwnerChrome } = useOwnerListingView();

  let editedDate = null;
  if (lastEditedAt) {
    try {
      editedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(lastEditedAt));
    } catch {
      editedDate = null;
    }
  }

  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <div className="flex w-full items-center justify-center gap-1.5 rounded-full border border-green-600/20 bg-green-50 px-4 py-2.5 text-green-800">
        <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium">Verified business</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {showOwnerChrome ? (
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-interactive hover:bg-muted"
          >
            <LayoutDashboard className="size-4 shrink-0" aria-hidden="true" />
            My dashboard
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        ) : null}
        {showOwnerChrome && isFeatured ? (
          <Link
            href="/settings?tab=payments"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/40 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
          >
            <Star className="size-4 shrink-0 fill-current" aria-hidden="true" />
            Featured Listing
          </Link>
        ) : null}
        {showOwnerChrome && !isFeatured ? (
          <Link
            href={`/pricing?business=${encodeURIComponent(businessId)}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-interactive hover:bg-muted"
          >
            <Star className="size-4 shrink-0" aria-hidden="true" />
            Get Featured
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {editedDate ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Last updated {editedDate}
        </p>
      ) : null}
    </div>
  );
}

export default function ClaimBusinessButton({
  businessId,
  businessSlug,
  businessName,
  email,
  emailStatus = null,
  isClaimed = false,
  isFeatured = false,
  hasDuplicateEmail = false,
  lastEditedAt = null,
}) {
  if (isClaimed) {
    return (
      <ClaimedBusinessStatus
        businessId={businessId}
        lastEditedAt={lastEditedAt}
        isFeatured={isFeatured}
      />
    );
  }

  const hasEmail =
    typeof email === "string" ? Boolean(email.trim()) : Boolean(email);

  if (isEmailUnderReview(emailStatus)) {
    return (
      <ClaimStatusLabel reason={EMAIL_UNDER_REVIEW_MESSAGE} showHowToClaim>
        Unclaimable
      </ClaimStatusLabel>
    );
  }

  if (!hasEmail) {
    return (
      <ClaimStatusLabel reason="No Email" showHowToClaim>
        Unclaimable
      </ClaimStatusLabel>
    );
  }

  if (hasDuplicateEmail) {
    return (
      <ClaimStatusLabel
        reason="Multiple Businesses have this Email"
        showHowToClaim
      >
        Unclaimable
      </ClaimStatusLabel>
    );
  }

  return (
    <ClaimBusinessButtonContent
      businessId={businessId}
      businessSlug={businessSlug}
      businessName={businessName}
      email={email}
    />
  );
}
