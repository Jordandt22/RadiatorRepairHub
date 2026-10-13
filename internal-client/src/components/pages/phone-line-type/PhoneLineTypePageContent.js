"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import PhoneLineTypeActions from "@/components/pages/phone-line-type/PhoneLineTypeActions";
import PhoneLineTypeJobsTable from "@/components/pages/phone-line-type/PhoneLineTypeJobsTable";
import PhoneLineTypeStartDialog from "@/components/pages/phone-line-type/PhoneLineTypeStartDialog";
import PhoneLineTypeTableSkeleton from "@/components/pages/phone-line-type/PhoneLineTypeTableSkeleton";

function isActiveJob(status) {
  return ["pending", "running"].includes(status);
}

function isDeletableJob(status) {
  return ["completed", "failed"].includes(status);
}

export default function PhoneLineTypePageContent() {
  const router = useRouter();
  const { accessToken, isReady, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [startError, setStartError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const jobsQuery = useQuery({
    queryKey: ["phone-line-type-jobs"],
    enabled: Boolean(accessToken),
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs ?? [];
      return jobs.some((job) => isActiveJob(job.status)) ? 3000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi("/admin/phone-line-type/jobs", {
        accessToken,
      });
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
    queryKey: ["phone-line-type-pending-count"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const result = await fetchApi("/admin/phone-line-type/pending-count", {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to count businesses");
      }
      return result.data;
    },
  });

  const jobs = useMemo(
    () => jobsQuery.data?.jobs ?? [],
    [jobsQuery.data?.jobs]
  );
  const jobIds = useMemo(() => new Set(jobs.map((job) => job.id)), [jobs]);
  const selectedJobIds = useMemo(() => {
    const next = new Set();
    for (const id of selectedIds) {
      if (jobIds.has(id)) next.add(id);
    }
    return next;
  }, [selectedIds, jobIds]);
  const pendingCount = pendingCountQuery.data?.pending_count ?? 0;
  const hasActiveJob = jobs.some((job) => isActiveJob(job.status));

  const startMutation = useMutation({
    mutationFn: async ({ limit }) => {
      const result = await fetchApi("/admin/phone-line-type/jobs", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ limit }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to start check");
      }
      return result.data;
    },
    onSuccess: () => {
      setStartError(null);
      queryClient.invalidateQueries({ queryKey: ["phone-line-type-jobs"] });
      queryClient.invalidateQueries({
        queryKey: ["phone-line-type-pending-count"],
      });
    },
    onError: (error) => {
      setStartError(error.message || "Failed to start check");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      const result = await fetchApi("/admin/phone-line-type/jobs", {
        method: "DELETE",
        accessToken,
        body: JSON.stringify({ job_ids: ids }),
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
      queryClient.invalidateQueries({ queryKey: ["phone-line-type-jobs"] });
    },
    onError: (error) => {
      setActionError(error.message || "Delete failed");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["phone-line-type-jobs"] }),
        queryClient.invalidateQueries({
          queryKey: ["phone-line-type-pending-count"],
        }),
      ]);
      return Promise.all([
        queryClient.refetchQueries({ queryKey: ["phone-line-type-jobs"] }),
        queryClient.refetchQueries({
          queryKey: ["phone-line-type-pending-count"],
        }),
      ]);
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
    if (checked) setSelectedIds(new Set(jobs.map((job) => job.id)));
    else setSelectedIds(new Set());
  };

  const handleDelete = () => {
    const ids = jobs
      .filter((job) => selectedJobIds.has(job.id) && isDeletableJob(job.status))
      .map((job) => job.id);
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

  const selectedJobs = jobs.filter((job) => selectedJobIds.has(job.id));
  const canDeleteSelected =
    selectedJobs.length > 0 &&
    selectedJobs.every((job) => isDeletableJob(job.status));

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">
          {pendingCount.toLocaleString()} businesses pending a line type check
        </p>
        <p className="mt-1 text-muted-foreground">
          Each run checks 50–500 businesses that have a phone number and have
          not been checked yet. Lookups are spaced at 5 per second so they stay
          under Twilio&apos;s rate limit. About $0.008 per unique number.
        </p>
      </div>

      <PhoneLineTypeActions
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

      <PhoneLineTypeStartDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        onSubmit={handleStartSubmit}
        submitPending={startMutation.isPending}
        submitError={startError}
        pendingCount={pendingCount}
      />

      {jobsQuery.isLoading ? (
        <PhoneLineTypeTableSkeleton />
      ) : (
        <PhoneLineTypeJobsTable
          jobs={jobs}
          selectedIds={selectedJobIds}
          onToggleId={handleToggleId}
          onToggleAll={handleToggleAll}
          onViewClick={(job) => router.push(`/phone-line-type/${job.id}`)}
        />
      )}
    </div>
  );
}
