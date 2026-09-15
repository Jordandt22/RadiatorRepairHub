"use client";

import { useState } from "react";
import { MapPin, MessageSquare, Phone, Share2 } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { trackBusinessStat } from "@/lib/businessStats/trackBusinessStat";
import QuickContactDialog from "@/components/businesses/QuickContactDialog";
import EmailListingDialog from "@/components/businesses/EmailListingDialog";
import { useToast } from "@/contexts/ToastProvider";

const heroBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors";
const stickyBtn =
  "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium transition-colors";

export default function BusinessHeroActions({
  businessId,
  businessName,
  phone,
  email,
  emailStatus = null,
  isClaimed = false,
  mapsHref,
  placement = "hero",
  shareUrl = null,
}) {
  const posthog = usePostHog();
  const { showCustomSuccess, showCustomError } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const isHero = placement === "hero";

  const capture = (event, extra = {}) => {
    posthog?.capture(event, {
      business_id: businessId || undefined,
      business_name: businessName || undefined,
      placement,
      ...extra,
    });
  };

  const trackStat = (event) => {
    if (!businessId) return;
    trackBusinessStat({ businessId, event });
  };

  const callClass = isHero
    ? `${heroBtn} bg-white text-primary hover:bg-white/90`
    : `${stickyBtn} bg-primary text-primary-foreground hover:bg-primary/90`;
  const secondaryClass = isHero
    ? `${heroBtn} border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15`
    : `${stickyBtn} border border-border bg-card text-foreground hover:bg-muted`;

  const resolveShareUrl = () => {
    if (shareUrl) return shareUrl;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleShare = async () => {
    if (isSharing) return;
    const url = resolveShareUrl();
    if (!url) return;

    setIsSharing(true);
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: businessName || "RadiatorRepairHub listing",
          text: businessName
            ? `Check out ${businessName} on RadiatorRepairHub`
            : "Check out this shop on RadiatorRepairHub",
          url,
        });
        capture("business_share_clicked", { method: "native" });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        capture("business_share_clicked", { method: "copy" });
        showCustomSuccess("Link copied to clipboard.");
        return;
      }

      showCustomError("Sharing is not supported in this browser.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          capture("business_share_clicked", { method: "copy" });
          showCustomSuccess("Link copied to clipboard.");
          return;
        }
      } catch {
        // fall through
      }
      showCustomError("Unable to share this listing right now.");
    } finally {
      setIsSharing(false);
    }
  };

  const callButton = phone ? (
    <a
      href={`tel:${phone}`}
      onClick={() => {
        capture("business_phone_clicked");
        trackStat("phone_click");
      }}
      className={callClass}
    >
      <Phone className="size-4 shrink-0" aria-hidden="true" />
      Call
    </a>
  ) : null;

  const messageButton = (
    <QuickContactDialog
      businessId={businessId}
      businessName={businessName}
      email={email}
      emailStatus={emailStatus}
      phone={phone}
      isClaimed={isClaimed}
      trigger={
        <button type="button" className={secondaryClass} />
      }
      triggerLabel="Message"
      showTriggerIcon={true}
    >
      <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
      Message
    </QuickContactDialog>
  );

  const directionsButton = mapsHref ? (
    <a
      href={mapsHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        capture("business_directions_clicked");
        trackStat("directions_click");
      }}
      className={secondaryClass}
    >
      <MapPin className="size-4 shrink-0" aria-hidden="true" />
      Directions
    </a>
  ) : null;

  const shareButton = (
    <button
      type="button"
      onClick={handleShare}
      disabled={isSharing}
      className={secondaryClass}
    >
      <Share2 className="size-4 shrink-0" aria-hidden="true" />
      Share
    </button>
  );

  const saveButton = businessId ? (
    <EmailListingDialog
      businessId={businessId}
      businessName={businessName}
      triggerClassName={secondaryClass}
      placement={placement}
    />
  ) : null;

  if (isHero) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {callButton}
        {messageButton}
        {directionsButton}
        {shareButton}
        {saveButton}
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        {callButton}
        {messageButton}
        {directionsButton}
      </div>
    </div>
  );
}
