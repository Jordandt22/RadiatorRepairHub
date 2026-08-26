"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

/** Fires once for checkout cancel pageviews. Success uses verified session status. */
export default function FeaturedCheckoutCancelTracker() {
  const posthog = usePostHog();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    posthog?.capture("featured_checkout_canceled", {
      source: "checkout_cancel",
    });
  }, [posthog]);

  return null;
}
