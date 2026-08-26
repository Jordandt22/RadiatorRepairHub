"use client";

import { useEffect, useRef } from "react";
import { trackBusinessStat } from "@/lib/businessStats/trackBusinessStat";

const VISIBLE_MS = 1000;
const VISIBLE_RATIO = 0.5;

export default function BusinessListingImpression({
  businessId,
  source,
  position,
  skip = false,
  children,
}) {
  const ref = useRef(null);
  const firedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    firedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [businessId, source, position]);

  useEffect(() => {
    if (skip || !businessId || !source || !position) return undefined;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (firedRef.current) return;
        if (entry?.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO) {
          if (timerRef.current) return;
          timerRef.current = setTimeout(() => {
            if (firedRef.current) return;
            firedRef.current = true;
            trackBusinessStat({
              businessId,
              event: "impression",
              source,
              position,
            });
          }, VISIBLE_MS);
          return;
        }
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      },
      { threshold: VISIBLE_RATIO }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [businessId, source, position, skip]);

  return (
    <div ref={ref} className="h-full w-full">
      {children}
    </div>
  );
}
