"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/lib/auth";
import { saveCurrentPath } from "@/lib/lastPath";
import { useSite } from "@/contexts/Site.context";
import { DEFAULT_SITE_ID, siteTokenKey } from "@/lib/sites";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

/** Pre-multi-site key. Adopted once as the default site's token. */
const LEGACY_TOKEN_KEY = "admin_token";

function readStoredToken(siteId) {
  try {
    const stored = localStorage.getItem(siteTokenKey(siteId));
    if (stored) return isTokenExpired(stored) ? null : stored;

    if (siteId === DEFAULT_SITE_ID) {
      const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      if (legacy && !isTokenExpired(legacy)) {
        localStorage.setItem(siteTokenKey(siteId), legacy);
        return legacy;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const { activeSiteId, isReady: isSiteReady } = useSite();
  const [accessToken, setAccessTokenState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Each site's API signs tokens with its own secret, so sessions are stored
  // and restored per site.
  const setAccessToken = (token) => {
    const key = siteTokenKey(activeSiteId);

    if (token && !isTokenExpired(token)) {
      localStorage.setItem(key, token);
      setAccessTokenState(token);
    } else {
      localStorage.removeItem(key);
      setAccessTokenState(null);
    }
  };

  const logout = () => {
    saveCurrentPath();
    setAccessToken(null);
    router.replace("/");
  };

  useEffect(() => {
    if (!isSiteReady) return;

    const stored = readStoredToken(activeSiteId);
    if (!stored) {
      try {
        localStorage.removeItem(siteTokenKey(activeSiteId));
      } catch {
        // ignore quota / private mode
      }
    }

    setAccessTokenState(stored);
    setIsReady(true);
  }, [activeSiteId, isSiteReady]);

  useEffect(() => {
    if (!accessToken) return;

    const checkExpiry = () => {
      if (isTokenExpired(accessToken)) {
        logout();
      }
    };

    checkExpiry();
    const intervalId = setInterval(checkExpiry, 30_000);
    return () => clearInterval(intervalId);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, logout, isReady }}
    >
      {children}
    </AuthContext.Provider>
  );
}
