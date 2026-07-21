"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/lib/auth";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "admin_token";

export function AuthProvider({ children }) {
  const router = useRouter();
  const [accessToken, setAccessTokenState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const setAccessToken = (token) => {
    if (token && !isTokenExpired(token)) {
      localStorage.setItem(TOKEN_KEY, token);
      setAccessTokenState(token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setAccessTokenState(null);
    }
  };

  const logout = () => {
    setAccessToken(null);
    router.replace("/");
  };

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && !isTokenExpired(stored)) {
      setAccessTokenState(stored);
    } else if (stored) {
      localStorage.removeItem(TOKEN_KEY);
    }
    setIsReady(true);
  }, []);

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
