"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import Pagination from "@/components/pages/dashboard/Pagination";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import OutreachTableSkeleton from "@/components/pages/outreach/OutreachTableSkeleton";

const PAGE_SIZE = 20;
const EMPTY_DELIVERIES = [];
const CAMPAIGN_LABELS = {
  claim_invite: "Claim Invite",
  ownership_claim_invite: "Ownership Claim Invite",
  lead_claim_invite: "Lead Claim Invite",
  claim_followup: "Claim Follow-up",
};

function statusVariant(status) {
  if (status === "failed") return "destructive";
  if (["completed", "sent"].includes(status)) return "secondary";
  return "outline";
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
    key: "phone",
    label: "Phone",
    className: "min-w-36",
    getValue: (row) => businessFor(row).phone || "—",
  },
  {
    key: "website",
    label: "Website",
    className: "min-w-44",
    getValue: (row) => businessFor(row).website || "—",
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

export default function OutreachScheduleJobDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.["job_id"];
  const { accessToken, isReady, logout } = useAuth();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isReady && !accessToken) router.replace("/");
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["outreach-scheduler-job", jobId],
    enabled: Boolean(accessToken && jobId),
    refetchInterval: (query) =>
      ["pending", "running"].includes(query.state.data?.job?.status)
        ? 4000
        : false,
    queryFn: async () => {
      const result = await fetchApi(
        `/admin/outreach/scheduler/jobs/${jobId}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load scheduled outreach job",
        );
      }
      return result.data;
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
      rows: deliveries.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
      ),
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
          render={<Link href="/outreach?tab=schedule" />}
        >
          <ArrowLeftIcon />
          Back to schedule
        </Button>
        <p className="text-sm text-destructive">
          {detailQuery.error?.message || "Scheduled outreach job not found."}
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
        render={<Link href="/outreach?tab=schedule" />}
      >
        <ArrowLeftIcon />
        Back to schedule
      </Button>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {CAMPAIGN_LABELS[job.outreach_type] ?? job.outreach_type}
          </h1>
          <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
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
      </div>

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
              setPage((value) =>
                Math.min(pagination.totalPages, value + 1),
              )
            }
          />
        ) : null}
      </div>
    </div>
  );
}
