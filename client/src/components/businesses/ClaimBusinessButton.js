"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, LayoutDashboard } from "lucide-react";
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
import { ToastProvider, useToast } from "@/contexts/ToastProvider";
import { claimBusiness } from "@/lib/api/businesses";
import { useIsBusinessOwner } from "@/hooks/useIsBusinessOwner";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { usePostHog } from "posthog-js/react";

function ClaimStatusLabel({ children, reason, showHowToClaim = false }) {
  return (
    <div className="mt-3 text-center">
      <p className="text-sm font-medium text-gray-500">{children}</p>
      {reason ? (
        <p className="mt-0.5 text-xs text-gray-400">{reason}</p>
      ) : null}
      {showHowToClaim ? (
        <Link
          href="/how-to-claim"
          className="mt-1.5 inline-block text-xs text-blue-600 hover:underline"
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
}) {
  const { showCustomError } = useToast();
  const posthog = usePostHog();
  const { isSignedIn } = useIsSignedIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

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
      const { data, error } = await claimBusiness(businessId);

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
      setMaskedEmail(data?.maskedEmail || "");
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
        className="mt-3 w-full rounded-full gap-2 text-sm font-medium border-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:scale-95 hover:text-amber-700"
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
              {maskedEmail || "the email"} on file for this business. Check your
              inbox and click the link to complete your claim.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button type="button" className="w-full sm:w-auto bg-blue-500 px-8 hover:bg-blue-600 hover:scale-95" />}
            >
              Got it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ClaimedBusinessStatus({ businessId, lastEditedAt = null }) {
  const { isOwner } = useIsBusinessOwner(businessId);

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
    <div className="mt-3 flex flex-col items-center gap-1.5">
      <div className="flex w-full items-center justify-center gap-1.5 rounded-full bg-green-500 p-2 text-white">
        <BadgeCheck className="size-5 shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium">Verified Business</p>
      </div>
      {isOwner ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          className="mt-1.5 w-full rounded-full gap-2 text-sm font-medium"
          render={<Link href="/dashboard" />}
        >
          <LayoutDashboard className="size-4" />
          My Dashboard
        </Button>
      ) : null}
      {editedDate ? (
        <p className="mt-2 text-center text-xs font-medium text-gray-600">
          Last Updated {editedDate}
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
  isClaimed = false,
  hasDuplicateEmail = false,
  lastEditedAt = null,
}) {
  if (isClaimed) {
    return (
      <ClaimedBusinessStatus
        businessId={businessId}
        lastEditedAt={lastEditedAt}
      />
    );
  }

  const hasEmail =
    typeof email === "string" ? Boolean(email.trim()) : Boolean(email);

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
    <ToastProvider>
      <ClaimBusinessButtonContent
        businessId={businessId}
        businessSlug={businessSlug}
        businessName={businessName}
      />
    </ToastProvider>
  );
}
