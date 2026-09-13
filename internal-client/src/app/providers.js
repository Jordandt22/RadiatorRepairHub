"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/Auth.context";
import { LoadingProvider } from "@/contexts/Loading.context";
import { SiteProvider } from "@/contexts/Site.context";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <SiteProvider>
          <AuthProvider>
            {children}
            <LoadingOverlay />
          </AuthProvider>
        </SiteProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}
