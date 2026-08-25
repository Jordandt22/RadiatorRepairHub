"use client";

import { useEffect } from "react";

/**
 * Manual AdSense unit. Script is loaded once from the root layout.
 * In-feed units typically use format="fluid" + a layoutKey from AdSense.
 */
export default function AdSenseUnit({
  slot,
  format = "auto",
  layoutKey,
  className,
  style,
}) {
  useEffect(() => {
    if (!slot || typeof window === "undefined") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers / missing script — ignore
    }
  }, [slot, format, layoutKey]);

  if (!slot) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={style ?? { display: "block" }}
        data-ad-client="ca-pub-6504336368539075"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        {...(format === "auto"
          ? { "data-full-width-responsive": "true" }
          : {})}
      />
    </div>
  );
}
