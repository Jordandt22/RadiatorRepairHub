"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useIsBusinessOwner } from "@/hooks/useIsBusinessOwner";

const OwnerListingViewContext = createContext(null);

const VISITOR_VIEW = {
  isOwner: false,
  loading: false,
  view: "edit",
  setView: () => {},
  showOwnerChrome: false,
};

export function OwnerListingViewProvider({ businessId, children }) {
  const { isOwner, loading } = useIsBusinessOwner(businessId);
  const [view, setView] = useState("edit");
  const showOwnerChrome = isOwner && view === "edit";

  const value = useMemo(
    () => ({ isOwner, loading, view, setView, showOwnerChrome }),
    [isOwner, loading, view, showOwnerChrome]
  );

  return (
    <OwnerListingViewContext.Provider value={value}>
      {children}
    </OwnerListingViewContext.Provider>
  );
}

export function useOwnerListingView() {
  const context = useContext(OwnerListingViewContext);
  return context || VISITOR_VIEW;
}
