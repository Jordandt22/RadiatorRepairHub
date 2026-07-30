"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import OverviewContactMessagesTable from "@/components/pages/overview/OverviewContactMessagesTable";
import OverviewClaimRequestsTable from "@/components/pages/overview/OverviewClaimRequestsTable";
import ContactMessagesTableSkeleton from "@/components/pages/dashboard/ContactMessagesTableSkeleton";
import ClaimRequestsTableSkeleton from "@/components/pages/claim-requests/ClaimRequestsTableSkeleton";

const PAGE_LIMIT = 10;

function RefreshButton({ onClick, pending, className }) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={onClick}
      aria-label="Refresh"
      className={cn(
        "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:bg-gray-100 max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
        className,
      )}
    >
      <RefreshCwIcon className={pending ? "animate-spin" : undefined} />
      <span className="hidden md:inline">Refresh</span>
    </Button>
  );
}

export default function OverviewDashboardPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [contactRefreshError, setContactRefreshError] = useState(null);
  const [claimsRefreshError, setClaimsRefreshError] = useState(null);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const contactQuery = useQuery({
    queryKey: ["dashboard-contact-messages"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_LIMIT),
        archived: "false",
      });

      const result = await fetchApi(
        `/admin/contact-messages?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch messages");
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    staleTime: 30_000,
  });

  const claimsQuery = useQuery({
    queryKey: ["dashboard-claim-requests"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_LIMIT),
      });

      const result = await fetchApi(
        `/admin/claim-requests?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch claim requests",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    staleTime: 30_000,
  });

  const contactRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "contact-messages" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setContactRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-contact-messages"],
      });
    },
    onError: (err) => {
      setContactRefreshError(err.message || "Failed to refresh");
    },
  });

  const claimsRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "claim-requests" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setClaimsRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-claim-requests"],
      });
    },
    onError: (err) => {
      setClaimsRefreshError(err.message || "Failed to refresh");
    },
  });

  if (!isReady || !accessToken) {
    return null;
  }

  const contactRefreshPending =
    contactRefreshMutation.isPending || contactQuery.isFetching;
  const claimsRefreshPending =
    claimsRefreshMutation.isPending || claimsQuery.isFetching;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-4 md:px-8 md:py-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Contact Form
            </h2>
            <p className="text-sm text-muted-foreground">
              Latest messages across all statuses
            </p>
          </div>
          <RefreshButton
            onClick={() => contactRefreshMutation.mutate()}
            pending={contactRefreshPending}
          />
        </div>
        {contactRefreshError ? (
          <p className="text-sm text-destructive">{contactRefreshError}</p>
        ) : null}
        {contactQuery.error && !contactQuery.isFetching ? (
          <p className="text-sm text-destructive">{contactQuery.error.message}</p>
        ) : null}
        {contactQuery.isLoading ? (
          <ContactMessagesTableSkeleton rows={5} />
        ) : !contactQuery.error ? (
          <OverviewContactMessagesTable
            messages={contactQuery.data?.contactMessages ?? []}
          />
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Claim Requests
            </h2>
            <p className="text-sm text-muted-foreground">
              Latest claims across all statuses
            </p>
          </div>
          <RefreshButton
            onClick={() => claimsRefreshMutation.mutate()}
            pending={claimsRefreshPending}
          />
        </div>
        {claimsRefreshError ? (
          <p className="text-sm text-destructive">{claimsRefreshError}</p>
        ) : null}
        {claimsQuery.error && !claimsQuery.isFetching ? (
          <p className="text-sm text-destructive">{claimsQuery.error.message}</p>
        ) : null}
        {claimsQuery.isLoading ? (
          <ClaimRequestsTableSkeleton rows={5} />
        ) : !claimsQuery.error ? (
          <OverviewClaimRequestsTable
            claimRequests={claimsQuery.data?.claimRequests ?? []}
          />
        ) : null}
      </section>
    </div>
  );
}
