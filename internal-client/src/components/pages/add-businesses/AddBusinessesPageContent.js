"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import { ensureQueryParam } from "@/lib/urlQueryState";
import AddBusinessesFilterTabs, {
  VALID_TABS,
} from "@/components/pages/add-businesses/AddBusinessesFilterTabs";
import IngestGroupsTable from "@/components/pages/add-businesses/IngestGroupsTable";
import IngestGroupsActions from "@/components/pages/add-businesses/IngestGroupsActions";
import IngestGroupsTableSkeleton from "@/components/pages/add-businesses/IngestGroupsTableSkeleton";
import IngestUploadDialog from "@/components/pages/add-businesses/IngestUploadDialog";
import ScrapeCitiesDialog from "@/components/pages/add-businesses/ScrapeCitiesDialog";
import ScrapeJobsTable from "@/components/pages/add-businesses/ScrapeJobsTable";

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "groups";
}

function isActiveGroup(status) {
  return ["pending", "filtering", "processing"].includes(status);
}

function isActiveScrape(status) {
  return ["pending", "running"].includes(status);
}

function isDeletableRow(row, tab) {
  return tab === "scraper"
    ? ["completed", "failed"].includes(row.status)
    : row.status === "completed";
}

export default function AddBusinessesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [scrapeDialogOpen, setScrapeDialogOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [scrapeError, setScrapeError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "groups", "/add-businesses");
  }, [searchParams]);

  useEffect(() => {
    setActiveTab(resolveTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
    });
  }, []);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    setSelectedIds(new Set());
    replaceTab(nextTab, "/add-businesses");
  };

  const groupsQuery = useQuery({
    queryKey: ["ingest-groups"],
    enabled: Boolean(accessToken),
    refetchInterval: (query) => {
      const groups = query.state.data?.groups ?? [];
      return groups.some((g) => isActiveGroup(g.status)) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi("/admin/ingest/groups", { accessToken });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load groups");
      }
      return result.data;
    },
  });

  const scrapeJobsQuery = useQuery({
    queryKey: ["apify-scrape-jobs"],
    enabled: Boolean(accessToken),
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs ?? [];
      return jobs.some((job) => isActiveScrape(job.status)) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi("/admin/apify-scrape/jobs", { accessToken });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load scrapes");
      }
      return result.data;
    },
  });

  const groups = groupsQuery.data?.groups ?? [];
  const scrapeJobs = scrapeJobsQuery.data?.jobs ?? [];
  const rows = activeTab === "scraper" ? scrapeJobs : groups;

  useEffect(() => {
    const validIds = new Set(rows.map((row) => row.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const uploadMutation = useMutation({
    mutationFn: async ({ name, file }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      const result = await fetchApi("/admin/ingest/groups", {
        method: "POST",
        accessToken,
        body: formData,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Upload failed");
      }
      return result.data;
    },
    onSuccess: () => {
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ["ingest-groups"] });
    },
    onError: (error) => {
      setUploadError(error.message || "Upload failed");
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: async (payload) => {
      const result = await fetchApi("/admin/apify-scrape/jobs", {
        method: "POST",
        accessToken,
        body: JSON.stringify(payload),
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
      setScrapeError(null);
      queryClient.invalidateQueries({ queryKey: ["apify-scrape-jobs"] });
    },
    onError: (error) => {
      setScrapeError(error.message || "Failed to start scrape");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      const isScraper = activeTab === "scraper";
      const result = await fetchApi(
        isScraper ? "/admin/apify-scrape/jobs" : "/admin/ingest/groups",
        {
          method: "DELETE",
          accessToken,
          body: JSON.stringify(
            isScraper ? { job_ids: ids } : { group_ids: ids },
          ),
        },
      );
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
      queryClient.invalidateQueries({ queryKey: ["ingest-groups"] });
      queryClient.invalidateQueries({ queryKey: ["apify-scrape-jobs"] });
    },
    onError: (error) => {
      setActionError(error.message || "Delete failed");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const queryKey =
        activeTab === "scraper" ? ["apify-scrape-jobs"] : ["ingest-groups"];
      await queryClient.invalidateQueries({ queryKey });
      return queryClient.refetchQueries({ queryKey });
    },
    onSuccess: () => setRefreshError(null),
    onError: (error) => {
      setRefreshError(error.message || "Refresh failed");
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
      setSelectedIds(new Set(rows.map((row) => row.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDelete = () => {
    const ids = rows
      .filter((row) => selectedIds.has(row.id) && isDeletableRow(row, activeTab))
      .map((row) => row.id);
    if (ids.length === 0) return;
    deleteMutation.mutate(ids);
  };

  const handleUploadSubmit = async ({ name, file }) => {
    setUploadError(null);
    try {
      await uploadMutation.mutateAsync({ name, file });
      return true;
    } catch {
      return false;
    }
  };

  const handleScrapeSubmit = async (payload) => {
    setScrapeError(null);
    try {
      await scrapeMutation.mutateAsync(payload);
      return true;
    } catch {
      return false;
    }
  };

  if (!isReady || !accessToken) return null;

  const isScraperTab = activeTab === "scraper";
  const isLoading = isScraperTab
    ? scrapeJobsQuery.isLoading
    : groupsQuery.isLoading;
  const activeQuery = isScraperTab ? scrapeJobsQuery : groupsQuery;
  const selectedRows = rows.filter((row) => selectedIds.has(row.id));
  const canDeleteSelected =
    selectedRows.length > 0 &&
    selectedRows.every((row) => isDeletableRow(row, activeTab));

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <AddBusinessesFilterTabs
        value={activeTab}
        onValueChange={handleTabChange}
      />

      <IngestGroupsActions
        selectedCount={selectedIds.size}
        actionDisabled={!canDeleteSelected || deleteMutation.isPending}
        onDelete={handleDelete}
        onRefresh={() => refreshMutation.mutate()}
        onUpload={() => {
          setUploadError(null);
          setUploadDialogOpen(true);
        }}
        onScrape={() => {
          setScrapeError(null);
          setScrapeDialogOpen(true);
        }}
        showUpload={!isScraperTab}
        refreshPending={refreshMutation.isPending || activeQuery.isFetching}
        deletePending={deleteMutation.isPending}
        uploadPending={uploadMutation.isPending}
        scrapePending={scrapeMutation.isPending}
        actionError={actionError}
        refreshError={
          refreshError ||
          (activeQuery.isError
            ? activeQuery.error?.message || "Failed to load data"
            : null)
        }
      />

      <IngestUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSubmit={handleUploadSubmit}
        submitPending={uploadMutation.isPending}
        submitError={uploadError}
      />

      <ScrapeCitiesDialog
        open={scrapeDialogOpen}
        onOpenChange={setScrapeDialogOpen}
        onSubmit={handleScrapeSubmit}
        submitPending={scrapeMutation.isPending}
        submitError={scrapeError}
      />

      {isLoading ? (
        <IngestGroupsTableSkeleton />
      ) : isScraperTab ? (
        <ScrapeJobsTable
          jobs={scrapeJobs}
          selectedIds={selectedIds}
          onToggleId={handleToggleId}
          onToggleAll={handleToggleAll}
          onViewClick={(job) =>
            router.push(`/add-businesses/scraper/${job.id}`)
          }
        />
      ) : (
        <IngestGroupsTable
          groups={groups}
          selectedIds={selectedIds}
          onToggleId={handleToggleId}
          onToggleAll={handleToggleAll}
          onViewClick={(group) => router.push(`/group/${group.id}`)}
        />
      )}
    </div>
  );
}
