"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import SystemsHealthStatusCard from "@/components/pages/systems/SystemsHealthStatusCard";

export function useSystemsHealth() {
  const { accessToken, isReady, logout } = useAuth();

  return useQuery({
    queryKey: ["admin-systems-health"],
    enabled: Boolean(isReady && accessToken),
    queryFn: async () => {
      const result = await fetchApi("/admin/systems/health", { accessToken });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to load health status",
        );
      }

      return result.data;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export default function SystemsHealthCheckSection({
  checkId,
  title,
  description,
  externalUrl = null,
  externalLabel = "Open",
}) {
  const { data, error, isLoading, isFetching, refetch } = useSystemsHealth();
  const check = data?.checks?.find((item) => item.id === checkId) ?? null;
  const checkWithTimestamp = check
    ? { ...check, checked_at: data?.checked_at ?? null }
    : null;

  return (
    <SystemsHealthStatusCard
      title={title}
      description={description}
      check={checkWithTimestamp}
      isLoading={isLoading}
      isFetching={isFetching}
      error={
        error?.message ||
        (!isLoading && !check ? "Health check not found" : null)
      }
      onRefresh={() => refetch()}
      externalUrl={externalUrl}
      externalLabel={externalLabel}
    />
  );
}
