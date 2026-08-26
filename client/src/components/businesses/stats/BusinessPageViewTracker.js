"use client";

import { useEffect, useRef } from "react";
import { useIsBusinessOwner } from "@/hooks/useIsBusinessOwner";
import { trackBusinessStat } from "@/lib/businessStats/trackBusinessStat";

export default function BusinessPageViewTracker({ businessId }) {
  const { isOwner, loading } = useIsBusinessOwner(businessId);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!businessId || loading || firedRef.current) return;
    if (isOwner) {
      firedRef.current = true;
      return;
    }
    firedRef.current = true;
    trackBusinessStat({ businessId, event: "page_view" });
  }, [businessId, isOwner, loading]);

  return null;
}
