"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import AddBusinessesFilterTabs, {
  VALID_TABS,
} from "@/components/pages/add-businesses/AddBusinessesFilterTabs";
import IngestGroupsTable from "@/components/pages/add-businesses/IngestGroupsTable";
import IngestGroupsActions from "@/components/pages/add-businesses/IngestGroupsActions";
import IngestGroupsTableSkeleton from "@/components/pages/add-businesses/IngestGroupsTableSkeleton";
import IngestUploadDialog from "@/components/pages/add-businesses/IngestUploadDialog";

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "groups";
}

function isActiveGroup(status) {
  return ["pending", "filtering", "processing"].includes(status);
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
  const [actionError, setActionError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

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
        "/add-businesses?tab=groups",
      );
    }
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

  const groups = groupsQuery.data?.groups ?? [];

  useEffect(() => {
    const validIds = new Set(groups.map((g) => g.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [groups]);

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

  const deleteMutation = useMutation({
    mutationFn: async (groupIds) => {
      const result = await fetchApi("/admin/ingest/groups", {
        method: "DELETE",
        accessToken,
        body: JSON.stringify({ group_ids: groupIds }),
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
      queryClient.invalidateQueries({ queryKey: ["ingest-groups"] });
    },
    onError: (error) => {
      setActionError(error.message || "Delete failed");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ingest-groups"] });
      return queryClient.refetchQueries({ queryKey: ["ingest-groups"] });
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
      setSelectedIds(new Set(groups.map((g) => g.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDelete = () => {
    const ids = groups
      .filter((g) => selectedIds.has(g.id) && g.status === "completed")
      .map((g) => g.id);
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

  if (!isReady || !accessToken) return null;

  const isLoading = groupsQuery.isLoading;
  const selectedGroups = groups.filter((g) => selectedIds.has(g.id));
  const canDeleteSelected =
    selectedGroups.length > 0 &&
    selectedGroups.every((g) => g.status === "completed");

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
        refreshPending={refreshMutation.isPending || groupsQuery.isFetching}
        deletePending={deleteMutation.isPending}
        uploadPending={uploadMutation.isPending}
        actionError={actionError}
        refreshError={
          refreshError ||
          (groupsQuery.isError
            ? groupsQuery.error?.message || "Failed to load groups"
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

      {isLoading ? (
        <IngestGroupsTableSkeleton />
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
