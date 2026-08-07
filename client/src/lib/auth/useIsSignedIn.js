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
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        await supabase.auth.signOut();
        setIsSignedIn(false);
        setUser(null);
        return null;
      }
      setIsSignedIn(true);
      setUser(data.user);
      return data.user;
    } catch {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      setIsSignedIn(false);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
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

      const clearLocalSession = async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
        applyUser(null);
      };

      supabase.auth.getUser().then(async ({ data, error }) => {
        if (!mounted) return;
        if (error || !data.user) {
          await clearLocalSession();
        } else {
          applyUser(data.user);
        }
        setIsLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        if (!session) {
          applyUser(null);
          setIsLoading(false);
          return;
        }

        // Session payload can lag behind Auth after email confirm — re-fetch user.
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          supabase.auth.getUser().then(async ({ data, error }) => {
            if (!mounted) return;
            if (error || !data.user) {
              await clearLocalSession();
            } else {
              applyUser(data.user);
            }
            setIsLoading(false);
          });
          return;
        }

        applyUser(session.user ?? null);
        setIsLoading(false);
      });

      unsubscribe = () => subscription.unsubscribe();
    } catch {
      if (mounted) {
        setIsSignedIn(false);
        setUser(null);
        setIsLoading(false);
      }
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isSignedIn, user, isLoading, refreshUser };
}
