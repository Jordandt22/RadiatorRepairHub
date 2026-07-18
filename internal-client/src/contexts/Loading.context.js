"use client";

import { createContext, useCallback, useContext, useState } from "react";

const LoadingContext = createContext(null);

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = useCallback(() => {
    setLoadingCount((count) => count + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingCount((count) => Math.max(0, count - 1));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setLoadingCount(isLoading ? 1 : 0);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading: loadingCount > 0,
        showLoading,
        hideLoading,
        setLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}
