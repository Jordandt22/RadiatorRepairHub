"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";

/**
 * Client-only: whether the signed-in user owns the given business.
 * Hides owner UI while loading or when not signed in.
 */
export function useIsBusinessOwner(businessId) {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      if (!businessId) {
        if (mounted) {
          setIsOwner(false);
          setLoading(false);
        }
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          if (mounted) {
            setIsOwner(false);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await fetchOwnedBusinesses();
        if (!mounted) return;

        if (error || !Array.isArray(data)) {
          setIsOwner(false);
        } else {
          setIsOwner(data.some((b) => b.id === businessId));
        }
      } catch {
        if (mounted) setIsOwner(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    setLoading(true);
    check();

    return () => {
      mounted = false;
    };
  }, [businessId]);

  return { isOwner: !loading && isOwner, loading };
}
