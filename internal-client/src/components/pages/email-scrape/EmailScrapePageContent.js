"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { ensureQueryParam } from "@/lib/urlQueryState";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import EmailScrapeFilterTabs, {
  VALID_TABS,
} from "@/components/pages/email-scrape/EmailScrapeFilterTabs";
import EmailScrapeJobsTable from "@/components/pages/email-scrape/EmailScrapeJobsTable";
import EmailScrapeActions from "@/components/pages/email-scrape/EmailScrapeActions";
import EmailScrapeTableSkeleton from "@/components/pages/email-scrape/EmailScrapeTableSkeleton";
import EmailScrapeStartDialog from "@/components/pages/email-scrape/EmailScrapeStartDialog";
import EmailScrapeBusinessesActions, {
  HAS_EMAIL_FILTERS,
  ATTEMPTS_FILTERS,
} from "@/components/pages/email-scrape/EmailScrapeBusinessesActions";
import EmailScrapeBusinessesTable from "@/components/pages/email-scrape/EmailScrapeBusinessesTable";
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

function parseBooleanFilter(item) {
  if (!item?.id) return null;
  if (item.id === "true") return true;
  if (item.id === "false") return false;
  return null;
}

export default function EmailScrapePageContent() {
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
  const [businessesRefreshError, setBusinessesRefreshError] = useState(null);
  const {
    q,
    page: businessesPage,
    hasEmail: hasEmailFilter,
    attempts: attemptsFilter,
    setField,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      hasEmail: {
        type: "option",
        param: "has_email",
        options: HAS_EMAIL_FILTERS,
      },
      attempts: {
        type: "option",
        param: "attempts",
        options: ATTEMPTS_FILTERS,
      },
    },
    { pathname: "/email-scrape" },
  );
  const [searchInput, setSearchInput] = useState(() => q || "");
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  const searchQuery = (q || "").trim();
  const hasEmailValue = parseBooleanFilter(hasEmailFilter);
  const hasAttemptsValue = parseBooleanFilter(attemptsFilter);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "jobs", "/email-scrape");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
    });
  }, []);

  useEffect(() => {
    setSearchInput(q || "");
  }, [q]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setFieldRef.current("q", value);
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
    replaceTab(nextTab, "/email-scrape");
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleHasEmailFilterChange = (value) => {
    setField("hasEmail", value);
  };

  const handleAttemptsFilterChange = (value) => {
    setField("attempts", value);
  };

  const jobsQuery = useQuery({
    queryKey: ["email-scrape-jobs"],
    enabled: Boolean(accessToken) && activeTab === "jobs",
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs ?? [];
      return jobs.some((j) => isActiveJob(j.status)) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi("/admin/email-scrape/jobs", { accessToken });
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
    queryKey: ["email-scrape-pending-count"],
    enabled: Boolean(accessToken) && activeTab === "jobs",
    refetchInterval: () => {
      const jobs = jobsQuery.data?.jobs ?? [];
      return jobs.some((j) => isActiveJob(j.status)) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi("/admin/email-scrape/pending-count", {
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
      "email-scrape-businesses",
      businessesPage,
      searchQuery,
      hasEmailValue,
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
      if (hasEmailValue !== null) {
        params.set("has_email", String(hasEmailValue));
      }
      if (hasAttemptsValue !== null) {
        params.set("has_attempts", String(hasAttemptsValue));
      }

      const result = await fetchApi(
        `/admin/email-scrape/businesses?${params.toString()}`,
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
      const result = await fetchApi("/admin/email-scrape/jobs", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ limit }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to start scrape");
      }
      return result.data;
    },
    onSuccess: () => {
      setStartError(null);
      queryClient.invalidateQueries({ queryKey: ["email-scrape-jobs"] });
      queryClient.invalidateQueries({
        queryKey: ["email-scrape-pending-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["email-scrape-businesses"] });
    },
    onError: (error) => {
      setStartError(error.message || "Failed to start scrape");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobIds) => {
      const result = await fetchApi("/admin/email-scrape/jobs", {
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
      queryClient.invalidateQueries({ queryKey: ["email-scrape-jobs"] });
    },
    onError: (error) => {
      setActionError(error.message || "Delete failed");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["email-scrape-jobs"] }),
        queryClient.invalidateQueries({
          queryKey: ["email-scrape-pending-count"],
        }),
      ]);
      return Promise.all([
        queryClient.refetchQueries({ queryKey: ["email-scrape-jobs"] }),
        queryClient.refetchQueries({
          queryKey: ["email-scrape-pending-count"],
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
        queryKey: ["email-scrape-businesses"],
      });
      return queryClient.refetchQueries({
        queryKey: ["email-scrape-businesses"],
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
      <EmailScrapeFilterTabs
        value={activeTab}
        onValueChange={handleTabChange}
      />

      {activeTab === "jobs" ? (
        <>
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {pendingCount.toLocaleString()} businesses pending email scrape
            </p>
            <p className="mt-1 text-muted-foreground">
              Each run scrapes websites for businesses with a website and no
              email (50–500 businesses), split into batches of 20. Home,
              contact, and about pages are checked; junk emails are discarded.
              Never-tried listings are prioritized; after 5 failed attempts a
              business is skipped.
            </p>
          </div>

          <EmailScrapeActions
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

          <EmailScrapeStartDialog
            open={startDialogOpen}
            onOpenChange={setStartDialogOpen}
            onSubmit={handleStartSubmit}
            submitPending={startMutation.isPending}
            submitError={startError}
            pendingCount={pendingCount}
          />

          {isJobsLoading ? (
            <EmailScrapeTableSkeleton />
          ) : (
            <EmailScrapeJobsTable
              jobs={jobs}
              selectedIds={selectedJobIds}
              onToggleId={handleToggleId}
              onToggleAll={handleToggleAll}
              onViewClick={(job) => router.push(`/email-scrape/${job.id}`)}
            />
          )}
        </>
      ) : (
        <>
          <EmailScrapeBusinessesActions
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            hasEmailFilter={hasEmailFilter}
            onHasEmailFilterChange={handleHasEmailFilterChange}
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
            <EmailScrapeTableSkeleton />
          ) : (
            <>
              <EmailScrapeBusinessesTable businesses={businesses} />
              <Pagination
                page={businessesPagination.page || businessesPage}
                totalPages={businessesPagination.totalPages || 0}
                displayPage={businessesPagination.page || businessesPage}
                total={businessesPagination.total || 0}
                isFetching={businessesQuery.isFetching}
                onPrevious={() =>
                  setField("page", Math.max(1, businessesPage - 1))
                }
                onNext={() =>
                  setField(
                    "page",
                    Math.min(
                      businessesPagination.totalPages || 1,
                      businessesPage + 1,
                    ),
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
