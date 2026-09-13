"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_SITE_ID,
  SITES,
  getSiteById,
  getDefaultSite,
  readActiveSiteId,
  writeActiveSiteId,
} from "@/lib/sites";

const SiteContext = createContext(null);

export const useSite = () => useContext(SiteContext);

export function SiteProvider({ children }) {
  const queryClient = useQueryClient();
  // Render the default site first so server and client markup agree, then
  // adopt the stored site once localStorage is available.
  const [activeSiteId, setActiveSiteIdState] = useState(DEFAULT_SITE_ID);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setActiveSiteIdState(readActiveSiteId());
    setIsReady(true);
  }, []);

  const setActiveSiteId = useCallback(
    (siteId) => {
      if (!getSiteById(siteId)) return;

      setActiveSiteIdState((current) => {
        if (current === siteId) return current;

        writeActiveSiteId(siteId);
        // Listings, counts, and job data belong to the previous site's API.
        queryClient.clear();
        return siteId;
      });
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      sites: SITES,
      activeSiteId,
      activeSite: getSiteById(activeSiteId) || getDefaultSite(),
      setActiveSiteId,
      isReady,
    }),
    [activeSiteId, setActiveSiteId, isReady],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
