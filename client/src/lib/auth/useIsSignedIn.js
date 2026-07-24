"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Client-only auth state for UI (navbar, etc.).
 * Starts signed-out to avoid hydration mismatch, then updates after mount.
 */
export function useIsSignedIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    try {
      const supabase = getSupabaseBrowserClient();

      const applySession = (session) => {
        if (!mounted) return;
        setIsSignedIn(Boolean(session));
        setUser(session?.user ?? null);
      };

      supabase.auth.getSession().then(({ data }) => {
        applySession(data.session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        applySession(session);
      });

      unsubscribe = () => subscription.unsubscribe();
    } catch {
      if (mounted) {
        setIsSignedIn(false);
        setUser(null);
      }
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isSignedIn, user };
}
