"use client";

import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";

/**
 * Hides unclaimed-listing extras (nearby shops, affiliate products) when the
 * signed-in user owns this page. Public is_claimed can be stale after a claim.
 */
export default function HideWhenListingOwner({ children }) {
  const { isOwner, loading } = useOwnerListingView();

  if (loading || isOwner) return null;

  return children;
}
