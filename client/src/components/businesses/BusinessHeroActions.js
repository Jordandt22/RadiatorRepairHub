"use client";

import { MapPin, MessageSquare, Phone } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import QuickContactDialog from "@/components/businesses/QuickContactDialog";

const heroBtn =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors";
const stickyBtn =
  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium transition-colors";

export default function BusinessHeroActions({
  businessId,
  businessName,
  phone,
  email,
  emailStatus = null,
  mapsHref,
  placement = "hero",
}) {
  const posthog = usePostHog();
  const isHero = placement === "hero";

  const capture = (event) => {
    posthog?.capture(event, {
      business_id: businessId || undefined,
      business_name: businessName || undefined,
      placement,
    });
  };

  const callClass = isHero
    ? `${heroBtn} bg-white text-primary hover:bg-white/90`
    : `${stickyBtn} bg-primary text-primary-foreground hover:bg-primary/90`;
  const secondaryClass = isHero
    ? `${heroBtn} border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15`
    : `${stickyBtn} border border-border bg-card text-foreground hover:bg-muted`;

  const callButton = phone ? (
    <a
      href={`tel:${phone}`}
      onClick={() => capture("business_phone_clicked")}
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
      onClick={() => capture("business_directions_clicked")}
      className={secondaryClass}
    >
      <MapPin className="size-4 shrink-0" aria-hidden="true" />
      Directions
    </a>
  ) : null;

  if (isHero) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {callButton}
        {messageButton}
        {directionsButton}
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
