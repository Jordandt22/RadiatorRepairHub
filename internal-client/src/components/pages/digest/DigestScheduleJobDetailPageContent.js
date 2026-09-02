"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import Pagination from "@/components/pages/dashboard/Pagination";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import OutreachTableSkeleton from "@/components/pages/outreach/OutreachTableSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 20;
const EMPTY_DELIVERIES = [];
const SEGMENT_LABELS = {
  unclaimed: "Unclaimed listings",
  claimed: "Claimed listings",
};

function jobStatusClassName(status) {
  if (status === "completed") {
    return "!border-transparent !bg-emerald-100 !text-emerald-800";
  }
  if (status === "failed") {
    return "!border-transparent !bg-rose-100 !text-rose-800";
  }
  if (status === "running") {
    return "!border-transparent !bg-violet-100 !text-violet-800";
  }
  if (status === "pending") {
    return "!border-transparent !bg-sky-100 !text-sky-800";
  }
  if (status === "cleared") {
    return "!border-transparent !bg-zinc-200 !text-zinc-800";
  }
  return "!border-transparent !bg-slate-100 !text-slate-700";
}

function deliveryStatusClassName(status) {
  if (status === "sent") {
    return "border-transparent bg-emerald-100 text-emerald-800";
  }
  if (status === "skipped") {
    return "border-transparent bg-amber-100 text-amber-800";
  }
  if (status === "failed") {
    return "border-transparent bg-rose-100 text-rose-800";
  }
  if (status === "sending") {
    return "border-transparent bg-violet-100 text-violet-800";
  }
  return "border-transparent bg-sky-100 text-sky-800";
}

function businessFor(row) {
  return row.businesses ?? row.business ?? {};
}

const DELIVERY_COLUMNS = [
  {
    key: "business",
    label: "Business",
    className: "min-w-52",
    render: (row) => {
      const business = businessFor(row);
      return (
        <div className="min-w-0">
          <div className="truncate font-semibold">{business.title || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {business.address || business.slug || "—"}
          </div>
        </div>
      );
    },
  },
  {
    key: "listing_email",
    label: "Listing email",
    className: "min-w-48",
    getValue: (row) => businessFor(row).email || "—",
  },
  {
    key: "recipient",
    label: "Sent recipient",
    className: "min-w-48",
    getValue: (row) => row.recipient || "—",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Badge
        variant="outline"
        className={deliveryStatusClassName(row.status)}
      >
        {row.status}
      </Badge>
    ),
  },
  {
    key: "provider_id",
    label: "Provider ID",
    className: "min-w-44",
    getValue: (row) => row.provider_message_id || "—",
  },
  {
    key: "reason",
    label: "Reason / error",
    className: "min-w-48",
    getValue: (row) => row.reason || "—",
  },
];

export default function DigestScheduleJobDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.["job_id"];
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearMessage, setClearMessage] = useState(null);
  const [clearError, setClearError] = useState(null);

  useEffect(() => {
    if (isReady && !accessToken) router.replace("/");
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["digest-scheduler-job", jobId],
    enabled: Boolean(accessToken && jobId),
    refetchInterval: (query) =>
      ["pending", "running"].includes(query.state.data?.job?.status)
        ? 4000
        : false,
    queryFn: async () => {
      const result = await fetchApi(`/admin/digest/scheduler/jobs/${jobId}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load scheduled digest job",
        );
      }
      return result.data;
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi(
        `/admin/digest/scheduler/jobs/${jobId}/history`,
        {
          method: "DELETE",
          accessToken,
        },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to clear digest history",
        );
      }
      return result.data;
    },
    onMutate: () => {
      setClearError(null);
      setClearMessage(null);
    },
    onSuccess: async (data) => {
      setClearDialogOpen(false);
      setClearMessage(
        `Cleared ${data?.deleted_history ?? 0} history row(s) and ${data?.deleted_deliveries ?? 0} delivery row(s). These businesses can be sent again this week.`,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["digest-scheduler-job", jobId],
        }),
        queryClient.invalidateQueries({ queryKey: ["digest-scheduler"] }),
      ]);
      setPage(1);
    },
    onError: (error) => {
      setClearError(error.message || "Failed to clear digest history");
    },
  });

  const job = detailQuery.data?.job;
  const deliveries = detailQuery.data?.deliveries ?? EMPTY_DELIVERIES;
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(deliveries.length / PAGE_SIZE);
    const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    return {
      page: safePage,
      totalPages,
      rows: deliveries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    };
  }, [deliveries, page]);

  if (!isReady || !accessToken) return null;
  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <OutreachTableSkeleton />
      </div>
    );
  }

  if (detailQuery.isError || !job) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          nativeButton={false}
          render={<Link href="/digest" />}
        >
          <ArrowLeftIcon />
          Back to schedule
        </Button>
        <p className="text-sm text-destructive">
          {detailQuery.error?.message || "Scheduled digest job not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-5 px-4 py-4 md:px-8 md:py-6">
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/digest" />}
      >
        <ArrowLeftIcon />
        Back to schedule
      </Button>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {SEGMENT_LABELS[job.digest_segment] ?? job.digest_segment}
          </h1>
          <Badge className={jobStatusClassName(job.status)}>{job.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Created {formatDate(job.created_at)}</span>
          <span>Configured limit {job.limit_count}</span>
          <span>Attempt {job.attempt_count ?? 0}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IngestCountBadge count={job.selected_count ?? 0} tone="info" />
          <span className="text-sm text-muted-foreground">selected</span>
          <IngestCountBadge count={job.sent_count ?? 0} tone="success" />
          <span className="text-sm text-muted-foreground">sent</span>
          <IngestCountBadge count={job.skipped_count ?? 0} tone="warning" />
          <span className="text-sm text-muted-foreground">skipped</span>
          <IngestCountBadge count={job.failed_count ?? 0} tone="danger" />
          <span className="text-sm text-muted-foreground">failed</span>
        </div>
        {job.failed_data?.message ? (
          <p className="text-sm text-destructive">{job.failed_data.message}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={
              clearHistoryMutation.isPending || job.status === "cleared"
            }
            onClick={() => {
              setClearError(null);
              setClearDialogOpen(true);
            }}
          >
            <Trash2Icon />
            Clear send history
          </Button>
          {clearMessage ? (
            <p className="text-sm text-muted-foreground">{clearMessage}</p>
          ) : null}
        </div>
      </div>

      <Dialog
        open={clearDialogOpen}
        onOpenChange={(next) => {
          if (clearHistoryMutation.isPending) return;
          setClearDialogOpen(next);
          if (!next) setClearError(null);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={!clearHistoryMutation.isPending}
        >
          <DialogHeader>
            <DialogTitle>Clear send history?</DialogTitle>
            <DialogDescription>
              This removes history and delivery rows for this job so those
              businesses can be reserved again this week. It does not unsend
              emails already delivered by Resend.
            </DialogDescription>
          </DialogHeader>
          {clearError ? (
            <p className="text-sm text-destructive">{clearError}</p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={clearHistoryMutation.isPending}
              onClick={() => setClearDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={clearHistoryMutation.isPending}
              onClick={() => clearHistoryMutation.mutate()}
            >
              {clearHistoryMutation.isPending
                ? "Clearing…"
                : "Clear send history"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3">
        <h2 className="text-base font-semibold">Selected businesses</h2>
        <IngestPayloadTable
          columns={DELIVERY_COLUMNS}
          rows={pagination.rows}
          emptyMessage="No businesses were selected for this job."
          getRowKey={(row) => row.id}
        />
        {pagination.totalPages > 1 ? (
          <Pagination
            page={pagination.page}
            displayPage={pagination.page}
            totalPages={pagination.totalPages}
            total={deliveries.length}
            onPrevious={() => setPage((value) => Math.max(1, value - 1))}
            onNext={() =>
              setPage((value) => Math.min(pagination.totalPages, value + 1))
            }
          />
        ) : null}
      </div>
    </div>
  );
}
