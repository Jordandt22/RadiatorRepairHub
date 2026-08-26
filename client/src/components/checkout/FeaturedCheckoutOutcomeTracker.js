"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

export default function FeaturedCheckoutOutcomeTracker({ outcome }) {
  const posthog = usePostHog();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !outcome) return;
    fired.current = true;

    if (outcome === "completed") {
      posthog?.capture("featured_checkout_completed", {
        source: "checkout_success",
      });
      return;
    }

    if (outcome === "canceled") {
      posthog?.capture("featured_checkout_canceled", {
        source: "checkout_cancel",
      });
    }
  }, [outcome, posthog]);

  return null;
}
