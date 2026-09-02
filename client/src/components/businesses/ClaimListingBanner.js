"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { claimBusiness, fetchBusinessBySlug } from "@/lib/api/businesses";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import { isClaimListingEligible } from "@/lib/claimListingEligibility";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";
import { cn } from "@/lib/utils";

function findOwnedBusiness(businesses, businessId) {
  if (!businessId || !Array.isArray(businesses)) return null;
  return (
    businesses.find((business) => String(business?.id) === String(businessId)) ??
    null
  );
}

export default function ClaimListingBanner({
  placement = "desktop",
  className = "",
  businessId,
  businessSlug,
  businessName,
  email: initialEmail,
  emailStatus: initialEmailStatus = null,
  isClaimed: initialIsClaimed = false,
  hasDuplicateEmail: initialHasDuplicateEmail = false,
}) {
  const { showCustomError } = useToast();
  const posthog = usePostHog();
  const { isSignedIn, isLoading: authLoading } = useIsSignedIn();
  const { isOwner, loading: ownerLoading } = useOwnerListingView();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [metaReady, setMetaReady] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [emailStatus, setEmailStatus] = useState(initialEmailStatus);
  const [isClaimed, setIsClaimed] = useState(initialIsClaimed);
  const [hasDuplicateEmail, setHasDuplicateEmail] = useState(
    initialHasDuplicateEmail
  );

  useEffect(() => {
    let active = true;

    async function loadClaimMeta() {
      try {
        const requests = [fetchBusinessBySlug(businessSlug)];
        if (isSignedIn) {
          requests.push(fetchOwnedBusinesses());
        }

        const [businessResult, ownedResult] = await Promise.all(requests);
        if (!active) return;

        const business = businessResult?.data;
        const ownedBusiness = ownedResult
          ? findOwnedBusiness(ownedResult.data, businessId)
          : null;

        if (business) {
          setEmail(business.email ?? initialEmail);
          setEmailStatus(business.email_status ?? initialEmailStatus);
          setHasDuplicateEmail(Boolean(business.has_duplicate_email));
          setIsClaimed(Boolean(ownedBusiness) || Boolean(business.is_claimed));
        } else if (ownedBusiness) {
          setIsClaimed(true);
        }
      } catch {
        if (!active) return;
        setEmail(initialEmail);
        setEmailStatus(initialEmailStatus);
        setHasDuplicateEmail(initialHasDuplicateEmail);
        setIsClaimed(initialIsClaimed);
      } finally {
        if (active) setMetaReady(true);
      }
    }

    if (authLoading) return;

    setMetaReady(false);
    loadClaimMeta();

    return () => {
      active = false;
    };
  }, [
    authLoading,
    businessId,
    businessSlug,
    initialEmail,
    initialEmailStatus,
    initialHasDuplicateEmail,
    initialIsClaimed,
    isSignedIn,
  ]);

  const initiallyEligible = isClaimListingEligible({
    isClaimed: initialIsClaimed,
    email: initialEmail,
    emailStatus: initialEmailStatus,
    hasDuplicateEmail: initialHasDuplicateEmail,
  });

  const eligible =
    initiallyEligible &&
    metaReady &&
    isClaimListingEligible({
      isClaimed,
      email,
      emailStatus,
      hasDuplicateEmail,
    });

  if (isOwner) return null;
  if (ownerLoading && !initialIsClaimed) return null;
  if (!eligible) return null;

  const capture = (event, props = {}) => {
    posthog?.capture(event, {
      business_id: businessId || undefined,
      business_slug: businessSlug || undefined,
      business_name: businessName || undefined,
      signed_in: Boolean(isSignedIn),
      source: "listing_banner",
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

  const wrapperClassName =
    placement === "mobile" ? "order-4 lg:hidden" : "hidden lg:block";

  return (
    <>
      <div className={wrapperClassName}>
        <div
          role="region"
          aria-label="Claim this listing"
          className={cn(
            "flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
            className
          )}
        >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BadgeCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading font-semibold text-foreground">
              Own this business?
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground max-w-sm">
              Claim your free listing to update info, add shop photos, receive
              Quick Contact inquiries, and show customers you&apos;re verified.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            className="shrink-0 rounded-full"
            disabled={isSubmitting}
            onClick={handleClaim}
          >
            <BadgeCheck className="size-4" aria-hidden="true" />
            {isSubmitting ? "Sending..." : "Claim this listing"}
          </Button>
          <Link
            href="/how-to-claim"
            className={buttonVariants({
              variant: "outline",
              className: "shrink-0 rounded-full",
            })}
            prefetch={false}
            onClick={() => capture("how_to_claim_clicked")}
          >
            How to claim
          </Link>
        </div>
      </div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check your inbox</DialogTitle>
            <DialogDescription>
              We&apos;ve sent a verification code to{" "}
              <strong className="font-semibold text-foreground">
                {email || "the email on file for this business"}
              </strong>
              . Check your inbox and click the link to complete your claim.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button type="button" className="w-full px-8 sm:w-auto" />}
            >
              Got it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
