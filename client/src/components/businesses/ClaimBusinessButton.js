"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, LayoutDashboard, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";
import { fetchBusinessBySlug } from "@/lib/api/businesses";
import {
  canClaimListing,
  getUnclaimableListingReason,
  isClaimListingEligible,
  isPhoneClaimListingEligible,
} from "@/lib/claimListingEligibility";
import ClaimListingDialog from "./ClaimListingDialog";
import ClaimInProgressNotice from "./ClaimInProgressNotice";

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
  emailStatus,
  hasDuplicateEmail,
  phone,
  emailEligible,
  phoneEligible,
  phoneBlockReason,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full rounded-full gap-2 text-sm font-medium border border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
        onClick={() => setDialogOpen(true)}
      >
        <BadgeCheck className="size-4" />
        Claim
      </Button>

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
        phoneBlockReason={phoneBlockReason}
        source="listing"
      />
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
            Manage Subscription
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
  email: initialEmail,
  emailStatus: initialEmailStatus = null,
  isClaimed: initialIsClaimed = false,
  isFeatured = false,
  hasDuplicateEmail: initialHasDuplicateEmail = false,
  lastEditedAt = null,
  phone: initialPhone = null,
  phoneClaimEligible: initialPhoneClaimEligible = false,
  phoneClaimBlockReason: initialPhoneClaimBlockReason = null,
  pendingClaim: initialPendingClaim = null,
}) {
  const { isOwner, loading } = useOwnerListingView();
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

  // Always refresh claim meta with no-store so pending claims are not stale
  // after starting a claim (SSR listing fetch used to cache for 120s).
  useEffect(() => {
    let active = true;

    async function loadClaimMeta() {
      try {
        const { data: business } = await fetchBusinessBySlug(businessSlug);
        if (!active) return;

        if (business) {
          setEmail(business.email ?? initialEmail);
          setEmailStatus(business.email_status ?? initialEmailStatus);
          setHasDuplicateEmail(Boolean(business.has_duplicate_email));
          setIsClaimed(Boolean(business.is_claimed));
          setPhone(business.phone ?? initialPhone);
          setPhoneClaimEligible(Boolean(business.phone_claim_eligible));
          setPhoneClaimBlockReason(business.phone_claim_block_reason ?? null);
          setPendingClaim(business.pending_claim ?? null);
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

    setMetaReady(false);
    loadClaimMeta();

    return () => {
      active = false;
    };
  }, [
    businessSlug,
    initialEmail,
    initialEmailStatus,
    initialHasDuplicateEmail,
    initialIsClaimed,
    initialPendingClaim,
    initialPhone,
    initialPhoneClaimBlockReason,
    initialPhoneClaimEligible,
  ]);

  const treatAsClaimed = Boolean(isClaimed) || isOwner;

  // Wait for ownership check so a stale public is_claimed=false does not flash
  // Claim next to Preview/Edit for the owner.
  if (loading && !initialIsClaimed) return null;

  if (treatAsClaimed) {
    return (
      <ClaimedBusinessStatus
        businessId={businessId}
        lastEditedAt={lastEditedAt}
        isFeatured={isFeatured}
      />
    );
  }

  // Avoid flashing Claim while we confirm whether a pending request exists.
  if (!metaReady && !initialPendingClaim) return null;

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

  if (pendingClaim || (!metaReady && initialPendingClaim)) {
    const claim = pendingClaim ?? initialPendingClaim;
    return (
      <ClaimInProgressNotice
        expiresAt={claim?.expires_at}
        businessId={businessId}
        businessSlug={businessSlug}
        businessName={businessName}
        channel={claim?.channel ?? null}
        className="mt-3"
      />
    );
  }

  if (!claimable) {
    const reason = getUnclaimableListingReason({
      phoneClaimBlockReason,
      email,
      emailStatus,
      hasDuplicateEmail,
    });

    return (
      <ClaimStatusLabel reason={reason} showHowToClaim>
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
      emailStatus={emailStatus}
      hasDuplicateEmail={hasDuplicateEmail}
      phone={phone}
      emailEligible={emailEligible}
      phoneEligible={phoneEligible}
      phoneBlockReason={phoneClaimBlockReason}
    />
  );
}
