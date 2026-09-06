"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { fetchBusinessBySlug } from "@/lib/api/businesses";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import {
  canClaimListing,
  isClaimListingEligible,
  isPhoneClaimListingEligible,
} from "@/lib/claimListingEligibility";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";
import { cn } from "@/lib/utils";
import ClaimListingDialog from "./ClaimListingDialog";

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
  phone: initialPhone = null,
  phoneClaimEligible: initialPhoneClaimEligible = false,
  phoneClaimBlockReason: initialPhoneClaimBlockReason = null,
  pendingClaim: initialPendingClaim = null,
}) {
  const posthog = usePostHog();
  const { isSignedIn, isLoading: authLoading } = useIsSignedIn();
  const { isOwner, loading: ownerLoading } = useOwnerListingView();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [metaReady, setMetaReady] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [emailStatus, setEmailStatus] = useState(initialEmailStatus);
  const [isClaimed, setIsClaimed] = useState(initialIsClaimed);
  const [hasDuplicateEmail, setHasDuplicateEmail] = useState(
    initialHasDuplicateEmail
  );
  const [phone, setPhone] = useState(initialPhone);
  const [phoneClaimEligible, setPhoneClaimEligible] = useState(
    initialPhoneClaimEligible
  );
  const [phoneClaimBlockReason, setPhoneClaimBlockReason] = useState(
    initialPhoneClaimBlockReason
  );
  const [pendingClaim, setPendingClaim] = useState(initialPendingClaim);

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
          setPhone(business.phone ?? initialPhone);
          setPhoneClaimEligible(Boolean(business.phone_claim_eligible));
          setPhoneClaimBlockReason(business.phone_claim_block_reason ?? null);
          setPendingClaim(business.pending_claim ?? null);
        } else if (ownedBusiness) {
          setIsClaimed(true);
        }
      } catch {
        if (!active) return;
        setEmail(initialEmail);
        setEmailStatus(initialEmailStatus);
        setHasDuplicateEmail(initialHasDuplicateEmail);
        setIsClaimed(initialIsClaimed);
        setPhone(initialPhone);
        setPhoneClaimEligible(initialPhoneClaimEligible);
        setPhoneClaimBlockReason(initialPhoneClaimBlockReason);
        setPendingClaim(initialPendingClaim);
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
    initialPhone,
    initialPendingClaim,
    initialPhoneClaimBlockReason,
    initialPhoneClaimEligible,
    isSignedIn,
  ]);

  const initiallyEligible = canClaimListing({
    isClaimed: initialIsClaimed,
    email: initialEmail,
    emailStatus: initialEmailStatus,
    hasDuplicateEmail: initialHasDuplicateEmail,
    phoneClaimEligible: initialPhoneClaimEligible,
    phoneClaimBlockReason: initialPhoneClaimBlockReason,
  });

  const emailEligible = isClaimListingEligible({
    isClaimed,
    email,
    emailStatus,
    hasDuplicateEmail,
  });
  const phoneEligible = isPhoneClaimListingEligible({
    isClaimed,
    phoneClaimEligible,
    phoneClaimBlockReason,
  });
  const claimable = canClaimListing({
    isClaimed,
    email,
    emailStatus,
    hasDuplicateEmail,
    phoneClaimEligible,
    phoneClaimBlockReason,
  });

  const eligible =
    initiallyEligible && metaReady && !pendingClaim && claimable;

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
            onClick={() => setDialogOpen(true)}
          >
            <BadgeCheck className="size-4" aria-hidden="true" />
            Claim this listing
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

      <ClaimListingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessId={businessId}
        businessSlug={businessSlug}
        businessName={businessName}
        email={email}
        emailStatus={emailStatus}
        hasDuplicateEmail={hasDuplicateEmail}
        phone={phone}
        emailEligible={emailEligible}
        phoneEligible={phoneEligible}
        phoneBlockReason={phoneClaimBlockReason}
        source="listing_banner"
      />
    </>
  );
}
