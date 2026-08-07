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
import ListingReportStatusFilterTabs, {
  TAB_STATUS,
  VALID_TABS,
} from "@/components/pages/listing-reports/ListingReportStatusFilterTabs";
import ListingReportActions from "@/components/pages/listing-reports/ListingReportActions";
import ListingReportsTable from "@/components/pages/listing-reports/ListingReportsTable";
import ListingReportsTableSkeleton from "@/components/pages/listing-reports/ListingReportsTableSkeleton";
import ListingReportDrawer from "@/components/pages/listing-reports/ListingReportDrawer";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 10;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "pending";
}

export default function ListingReportsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const { page, setField } = useUrlQueryState(
    { page: { type: "page" } },
    { pathname: "/listing-reports" },
  );
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const statusFilter = TAB_STATUS[activeTab] ?? "pending";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "pending", "/listing-reports");
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
    replaceTab(nextTab, "/listing-reports");
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
    queryKey: ["listing-reports", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        status: statusFilter,
      });

      const result = await fetchApi(
        `/admin/listing-reports?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch listing reports",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, listing_report_ids }) => {
      const result = await fetchApi("/admin/listing-reports/status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ status, listing_report_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to update status";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["listing-reports"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to update status");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "listing-reports" }),
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
      await queryClient.invalidateQueries({ queryKey: ["listing-reports"] });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(statusMutation.isPending);
  }, [statusMutation.isPending, setLoading]);

  const listingReports = useMemo(
    () => data?.listingReports ?? [],
    [data?.listingReports],
  );

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
      for (const row of listingReports) {
        if (checked) next.add(row.listing_report_id);
        else next.delete(row.listing_report_id);
      }
      return next;
    });
  };

  const mutateSelectedStatus = (status) => {
    const listing_report_ids = Array.from(selectedIds);
    if (listing_report_ids.length === 0 || statusMutation.isPending) return;
    setActionError(null);
    statusMutation.mutate({ status, listing_report_ids });
  };

  const handleViewClick = (report) => {
    setSelectedReport(report);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <ListingReportStatusFilterTabs
        value={activeTab}
        onValueChange={handleTabChange}
      />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <ListingReportActions
          selectedCount={selectedIds.size}
          showResolveDismiss={activeTab === "pending"}
          showReopen={activeTab === "resolved" || activeTab === "dismissed"}
          actionDisabled={actionDisabled}
          onResolve={() => mutateSelectedStatus("resolved")}
          onDismiss={() => mutateSelectedStatus("dismissed")}
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
          <ListingReportsTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <ListingReportsTable
            listingReports={listingReports}
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

      <ListingReportDrawer
        report={selectedReport}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
