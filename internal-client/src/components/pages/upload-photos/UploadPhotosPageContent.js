"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import UploadPhotosFilterTabs, {
  VALID_TABS,
} from "@/components/pages/upload-photos/UploadPhotosFilterTabs";
import UploadPhotosJobsTable from "@/components/pages/upload-photos/UploadPhotosJobsTable";
import UploadPhotosActions from "@/components/pages/upload-photos/UploadPhotosActions";
import UploadPhotosTableSkeleton from "@/components/pages/upload-photos/UploadPhotosTableSkeleton";
import UploadPhotosStartDialog from "@/components/pages/upload-photos/UploadPhotosStartDialog";
import UploadPhotosBusinessesActions from "@/components/pages/upload-photos/UploadPhotosBusinessesActions";
import UploadPhotosBusinessesTable from "@/components/pages/upload-photos/UploadPhotosBusinessesTable";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "jobs";
}

function isActiveJob(status) {
  return ["pending", "running"].includes(status);
}

function isDeletableJob(status) {
  return ["completed", "failed"].includes(status);
}

function parseCdnStoredFilter(item) {
  if (!item?.id) return null;
  if (item.id === "true") return true;
  if (item.id === "false") return false;
  return null;
}

function parseAttemptsFilter(item) {
  if (!item?.id) return null;
  if (item.id === "true") return true;
  if (item.id === "false") return false;
  return null;
}

export default function UploadPhotosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [startError, setStartError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [businessesPage, setBusinessesPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cdnStoredFilter, setCdnStoredFilter] = useState(null);
  const [attemptsFilter, setAttemptsFilter] = useState(null);
  const [businessesRefreshError, setBusinessesRefreshError] = useState(null);

  const searchQuery = debouncedSearch.trim();
  const cdnStoredValue = parseCdnStoredFilter(cdnStoredFilter);
  const hasAttemptsValue = parseAttemptsFilter(attemptsFilter);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      window.history.replaceState(
        window.history.state,
        "",
        "/upload-photos?tab=jobs",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
    });
  }, []);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
        setBusinessesPage(1);
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    setSelectedIds(new Set());
    replaceTab(nextTab, "/upload-photos");
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleCdnStoredFilterChange = (value) => {
    setCdnStoredFilter(value);
    setBusinessesPage(1);
  };

  const handleAttemptsFilterChange = (value) => {
    setAttemptsFilter(value);
    setBusinessesPage(1);
  };

  const jobsQuery = useQuery({
    queryKey: ["cdn-upload-jobs"],
    enabled: Boolean(accessToken) && activeTab === "jobs",
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs ?? [];
      return jobs.some((j) => isActiveJob(j.status)) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi("/admin/cdn-upload/jobs", { accessToken });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load jobs");
      }
      return result.data;
    },
  });

  const pendingCountQuery = useQuery({
    queryKey: ["cdn-upload-pending-count"],
    enabled: Boolean(accessToken) && activeTab === "jobs",
    refetchInterval: () => {
      const jobs = jobsQuery.data?.jobs ?? [];
      return jobs.some((j) => isActiveJob(j.status)) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi("/admin/cdn-upload/pending-count", {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load pending count");
      }
      return result.data;
    },
  });

  const businessesQuery = useQuery({
    queryKey: [
      "cdn-upload-businesses",
      businessesPage,
      searchQuery,
      cdnStoredValue,
      hasAttemptsValue,
    ],
    enabled: Boolean(accessToken) && activeTab === "businesses",
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(businessesPage),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) {
        params.set("q", searchQuery);
      }
      if (cdnStoredValue !== null) {
        params.set("cdn_stored", String(cdnStoredValue));
      }
      if (hasAttemptsValue !== null) {
        params.set("has_attempts", String(hasAttemptsValue));
      }

      const result = await fetchApi(
        `/admin/cdn-upload/businesses?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load businesses");
      }
      return result.data;
    },
  });

  const jobs = useMemo(
    () => jobsQuery.data?.jobs ?? [],
    [jobsQuery.data?.jobs],
  );
  const jobIds = useMemo(() => new Set(jobs.map((j) => j.id)), [jobs]);
  const selectedJobIds = useMemo(() => {
    const next = new Set();
    for (const id of selectedIds) {
      if (jobIds.has(id)) next.add(id);
    }
    return next;
  }, [selectedIds, jobIds]);
  const pendingCount = pendingCountQuery.data?.pending_count ?? 0;
  const hasActiveJob = jobs.some((j) => isActiveJob(j.status));
  const businesses = businessesQuery.data?.businesses ?? [];
  const businessesPagination = businessesQuery.data?.pagination ?? {
    page: businessesPage,
    totalPages: 0,
    total: 0,
  };

  const startMutation = useMutation({
    mutationFn: async ({ limit }) => {
      const result = await fetchApi("/admin/cdn-upload/jobs", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ limit }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to start upload");
      }
      return result.data;
    },
    onSuccess: () => {
      setStartError(null);
      queryClient.invalidateQueries({ queryKey: ["cdn-upload-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["cdn-upload-pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["cdn-upload-businesses"] });
    },
    onError: (error) => {
      setStartError(error.message || "Failed to start upload");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobIds) => {
      const result = await fetchApi("/admin/cdn-upload/jobs", {
        method: "DELETE",
        accessToken,
        body: JSON.stringify({ job_ids: jobIds }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Delete failed");
      }
      return result.data;
    },
    onSuccess: () => {
      setActionError(null);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["cdn-upload-jobs"] });
    },
    onError: (error) => {
      setActionError(error.message || "Delete failed");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cdn-upload-jobs"] }),
        queryClient.invalidateQueries({
          queryKey: ["cdn-upload-pending-count"],
        }),
      ]);
      return Promise.all([
        queryClient.refetchQueries({ queryKey: ["cdn-upload-jobs"] }),
        queryClient.refetchQueries({
          queryKey: ["cdn-upload-pending-count"],
        }),
      ]);
    },
    onSuccess: () => setRefreshError(null),
    onError: (error) => {
      setRefreshError(error.message || "Refresh failed");
    },
  });

  const businessesRefreshMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cdn-upload-businesses"],
      });
      return queryClient.refetchQueries({
        queryKey: ["cdn-upload-businesses"],
      });
    },
    onSuccess: () => setBusinessesRefreshError(null),
    onError: (error) => {
      setBusinessesRefreshError(error.message || "Refresh failed");
    },
  });

  const handleToggleId = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(jobs.map((j) => j.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDelete = () => {
    const ids = jobs
      .filter((j) => selectedJobIds.has(j.id) && isDeletableJob(j.status))
      .map((j) => j.id);
    if (ids.length === 0) return;
    deleteMutation.mutate(ids);
  };

  const handleStartSubmit = async ({ limit }) => {
    setStartError(null);
    try {
      await startMutation.mutateAsync({ limit });
      return true;
    } catch {
      return false;
    }
  };

  if (!isReady || !accessToken) return null;

  const isJobsLoading = jobsQuery.isLoading;
  const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));
  const canDeleteSelected =
    selectedJobs.length > 0 &&
    selectedJobs.every((j) => isDeletableJob(j.status));

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <UploadPhotosFilterTabs
        value={activeTab}
        onValueChange={handleTabChange}
      />

      {activeTab === "jobs" ? (
        <>
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {pendingCount.toLocaleString()} businesses pending CDN upload
            </p>
            <p className="mt-1 text-muted-foreground">
              Each run uploads Google Place photos to Cloudinary (50-500
              businesses), split into batches of 20. Never-tried listings are
              prioritized, then the most recently added; after 5 failed attempts
              a business is skipped.
            </p>
          </div>

          <UploadPhotosActions
            selectedCount={selectedJobIds.size}
            actionDisabled={!canDeleteSelected || deleteMutation.isPending}
            startDisabled={hasActiveJob || pendingCount === 0}
            onDelete={handleDelete}
            onRefresh={() => refreshMutation.mutate()}
            onStart={() => {
              setStartError(null);
              setStartDialogOpen(true);
            }}
            refreshPending={
              refreshMutation.isPending ||
              jobsQuery.isFetching ||
              pendingCountQuery.isFetching
            }
            deletePending={deleteMutation.isPending}
            startPending={startMutation.isPending}
            actionError={actionError}
            startError={startError}
            refreshError={
              refreshError ||
              (jobsQuery.isError
                ? jobsQuery.error?.message || "Failed to load jobs"
                : null)
            }
          />

          <UploadPhotosStartDialog
            open={startDialogOpen}
            onOpenChange={setStartDialogOpen}
            onSubmit={handleStartSubmit}
            submitPending={startMutation.isPending}
            submitError={startError}
            pendingCount={pendingCount}
          />

          {isJobsLoading ? (
            <UploadPhotosTableSkeleton />
          ) : (
            <UploadPhotosJobsTable
              jobs={jobs}
              selectedIds={selectedJobIds}
              onToggleId={handleToggleId}
              onToggleAll={handleToggleAll}
              onViewClick={(job) => router.push(`/upload-photos/${job.id}`)}
            />
          )}
        </>
      ) : (
        <>
          <UploadPhotosBusinessesActions
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            cdnStoredFilter={cdnStoredFilter}
            onCdnStoredFilterChange={handleCdnStoredFilterChange}
            attemptsFilter={attemptsFilter}
            onAttemptsFilterChange={handleAttemptsFilterChange}
            onRefresh={() => businessesRefreshMutation.mutate()}
            refreshPending={
              businessesRefreshMutation.isPending || businessesQuery.isFetching
            }
            refreshError={
              businessesRefreshError ||
              (businessesQuery.isError
                ? businessesQuery.error?.message || "Failed to load businesses"
                : null)
            }
          />

          {businessesQuery.isLoading ? (
            <UploadPhotosTableSkeleton />
          ) : (
            <>
              <UploadPhotosBusinessesTable businesses={businesses} />
              <Pagination
                page={businessesPagination.page || businessesPage}
                totalPages={businessesPagination.totalPages || 0}
                displayPage={businessesPagination.page || businessesPage}
                total={businessesPagination.total || 0}
                isFetching={businessesQuery.isFetching}
                onPrevious={() =>
                  setBusinessesPage((page) => Math.max(1, page - 1))
                }
                onNext={() =>
                  setBusinessesPage((page) =>
                    Math.min(businessesPagination.totalPages || 1, page + 1),
                  )
                }
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
