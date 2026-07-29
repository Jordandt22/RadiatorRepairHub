"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Client-only auth state for UI (navbar, etc.).
 * Starts signed-out to avoid hydration mismatch, then updates after mount.
 * Uses getUser() (Auth server) so email / new_email stay fresh after changes.
 */
export function useIsSignedIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setIsSignedIn(false);
        setUser(null);
        return null;
      }
      setIsSignedIn(true);
      setUser(data.user);
      return data.user;
    } catch {
      setIsSignedIn(false);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    try {
      const supabase = getSupabaseBrowserClient();

      const applyUser = (nextUser) => {
        if (!mounted) return;
        setIsSignedIn(Boolean(nextUser));
        setUser(nextUser ?? null);
      };

      supabase.auth.getUser().then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data.user) {
          applyUser(null);
          return;
        }
        applyUser(data.user);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        if (!session) {
          applyUser(null);
          return;
        }

        // Session payload can lag behind Auth after email confirm — re-fetch user.
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          supabase.auth.getUser().then(({ data, error }) => {
            if (!mounted) return;
            if (error || !data.user) {
              applyUser(session.user ?? null);
              return;
            }
            applyUser(data.user);
          });
          return;
        }

        applyUser(session.user ?? null);
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

  return { isSignedIn, user, refreshUser };
}
