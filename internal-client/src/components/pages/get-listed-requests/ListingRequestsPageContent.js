"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { useLoading } from "@/contexts/Loading.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import { ensureQueryParam } from "@/lib/urlQueryState";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import ListingRequestStatusFilterTabs, {
  TAB_STATUS,
  VALID_TABS,
} from "@/components/pages/get-listed-requests/ListingRequestStatusFilterTabs";
import ListingRequestActions from "@/components/pages/get-listed-requests/ListingRequestActions";
import ListingRequestsTable from "@/components/pages/get-listed-requests/ListingRequestsTable";
import ListingRequestsTableSkeleton from "@/components/pages/get-listed-requests/ListingRequestsTableSkeleton";
import ListingRequestDrawer from "@/components/pages/get-listed-requests/ListingRequestDrawer";
import MarkListedDialog from "@/components/pages/get-listed-requests/MarkListedDialog";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 10;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "pending";
}

export default function ListingRequestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const { page, setField } = useUrlQueryState(
    { page: { type: "page" } },
    { pathname: "/get-listed-requests" },
  );
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [markListedOpen, setMarkListedOpen] = useState(false);
  const [markListedError, setMarkListedError] = useState(null);

  const statusFilter = TAB_STATUS[activeTab] ?? "pending";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "pending", "/get-listed-requests");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
      setField("page", 1);
    });
  }, [setField]);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceTab(nextTab, "/get-listed-requests");
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
    setSelectedIds(new Set());
  };

  const handleNextPage = () => {
    setField("page", page + 1);
    setSelectedIds(new Set());
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["listing-requests", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        status: statusFilter,
      });

      const result = await fetchApi(
        `/admin/listing-requests?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch listing requests",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, listing_request_ids, business_slug }) => {
      const result = await fetchApi("/admin/listing-requests/status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({
          status,
          listing_request_ids,
          ...(business_slug ? { business_slug } : {}),
        }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : result.error?.message?.business_slug ||
              "Failed to update status";
        throw new Error(
          typeof message === "string" ? message : "Failed to update status",
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setMarkListedError(null);
      setSelectedIds(new Set());
      setMarkListedOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["listing-requests"] });
    },
    onError: (err, variables) => {
      const message = err.message || "Failed to update status";
      if (variables?.status === "listed") {
        setMarkListedError(message);
        return;
      }
      setActionError(message);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "listing-requests" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setRefreshError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["listing-requests"] });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(statusMutation.isPending);
  }, [statusMutation.isPending, setLoading]);

  const listingRequests = useMemo(
    () => data?.listingRequests ?? [],
    [data?.listingRequests],
  );

  const selectedMarkListedRequest = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    const id = Array.from(selectedIds)[0];
    return listingRequests.find((row) => row.listing_request_id === id) ?? null;
  }, [selectedIds, listingRequests]);

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const actionDisabled = !hasSelection || statusMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;

  const handleToggleId = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleAll = (checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const row of listingRequests) {
        if (checked) next.add(row.listing_request_id);
        else next.delete(row.listing_request_id);
      }
      return next;
    });
  };

  const mutateSelectedStatus = (status, business_slug) => {
    const listing_request_ids = Array.from(selectedIds);
    if (listing_request_ids.length === 0 || statusMutation.isPending) return;
    setActionError(null);
    statusMutation.mutate({ status, listing_request_ids, business_slug });
  };

  const handleMarkListedClick = () => {
    if (selectedIds.size === 0 || statusMutation.isPending) return;
    if (selectedIds.size !== 1) {
      setActionError("Select exactly one request to mark as listed.");
      return;
    }
    setActionError(null);
    setMarkListedError(null);
    setMarkListedOpen(true);
  };

  const handleViewClick = (request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <ListingRequestStatusFilterTabs
        value={activeTab}
        onValueChange={handleTabChange}
      />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <ListingRequestActions
          selectedCount={selectedIds.size}
          showPendingActions={activeTab === "pending"}
          showReopen={
            activeTab === "listed" ||
            activeTab === "rejected" ||
            activeTab === "duplicate"
          }
          actionDisabled={actionDisabled}
          onMarkListed={handleMarkListedClick}
          onReject={() => mutateSelectedStatus("rejected")}
          onMarkDuplicate={() => mutateSelectedStatus("duplicate")}
          onReopen={() => mutateSelectedStatus("pending")}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          actionError={actionError}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <ListingRequestsTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <ListingRequestsTable
            listingRequests={listingRequests}
            selectedIds={selectedIds}
            onToggleId={handleToggleId}
            onToggleAll={handleToggleAll}
            onViewClick={handleViewClick}
            activeTab={activeTab}
          />
        ) : null}

        <Pagination
          page={page}
          totalPages={totalPages}
          displayPage={data?.page ?? page}
          total={data?.total}
          isFetching={isFetching}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </div>

      <ListingRequestDrawer
        request={selectedRequest}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <MarkListedDialog
        open={markListedOpen}
        onOpenChange={(open) => {
          setMarkListedOpen(open);
          if (!open) setMarkListedError(null);
        }}
        businessName={selectedMarkListedRequest?.business_name || ""}
        selectedCount={selectedIds.size}
        confirmPending={statusMutation.isPending}
        submitError={markListedError}
        onClearSubmitError={() => setMarkListedError(null)}
        onConfirm={(businessSlug) =>
          mutateSelectedStatus("listed", businessSlug)
        }
      />
    </div>
  );
}
