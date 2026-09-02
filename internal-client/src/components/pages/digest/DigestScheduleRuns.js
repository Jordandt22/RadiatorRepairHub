"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

const SEGMENT_FILTER_OPTIONS = [
  { id: "unclaimed", label: "Unclaimed listings" },
  { id: "claimed", label: "Claimed listings" },
];

const SEGMENT_LABELS = {
  unclaimed: "Unclaimed listings",
  claimed: "Claimed listings",
};

const SEGMENT_BORDER_COLORS = {
  unclaimed: "border-l-4 border-l-sky-400",
  claimed: "border-l-4 border-l-emerald-400",
};

function formatPacificDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZoneName: "short",
  });
}

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

function childJobs(run) {
  if (Array.isArray(run?.digest_send_jobs)) return run.digest_send_jobs;
  if (Array.isArray(run?.children)) return run.children;
  if (Array.isArray(run?.child_jobs)) return run.child_jobs;
  if (Array.isArray(run?.jobs)) return run.jobs;
  return [];
}

function QueueSummary({ state }) {
  if (!state) return <span>Paused or unavailable</span>;
  const entries = Object.entries(state).filter(
    ([, value]) => typeof value === "string" || typeof value === "number",
  );
  if (entries.length === 0) return <span>Unavailable</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, value]) => (
        <Badge key={key} variant="outline">
          {key.replaceAll("_", " ")}: {value}
        </Badge>
      ))}
    </div>
  );
}

const JOB_COLUMNS = [
  {
    key: "campaign",
    label: "Campaign",
    className: "min-w-48",
    render: (row) => (
      <Link
        href={`/digest/schedule/${row.id}`}
        className="font-semibold hover:underline"
      >
        {SEGMENT_LABELS[row.digest_segment] ?? row.digest_segment ?? "—"}
        {Number.isInteger(row.chunk_index) ? ` · batch ${row.chunk_index + 1}` : ""}
      </Link>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Badge className={jobStatusClassName(row.status)}>{row.status}</Badge>
    ),
  },
  {
    key: "limit",
    label: "Limit",
    getValue: (row) => String(row.limit_count ?? 0),
  },
  {
    key: "sent",
    label: "Sent",
    render: (row) => (
      <IngestCountBadge count={row.sent_count ?? 0} tone="success" />
    ),
  },
  {
    key: "skipped",
    label: "Skipped",
    render: (row) => (
      <IngestCountBadge count={row.skipped_count ?? 0} tone="warning" />
    ),
  },
  {
    key: "failed",
    label: "Failed",
    render: (row) => (
      <IngestCountBadge count={row.failed_count ?? 0} tone="danger" />
    ),
  },
  {
    key: "created",
    label: "Created",
    className: "min-w-36",
    getValue: (row) => formatFullDate(row.created_at),
  },
  {
    key: "actions",
    label: "",
    cellClassName: "text-right",
    render: (row) => (
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`/digest/schedule/${row.id}`} />}
      >
        <EyeIcon />
        View
      </Button>
    ),
  },
];

export default function DigestScheduleRuns({
  nextRunAt,
  lastRunAt,
  bullmqState,
  recentRuns,
}) {
  const [segmentFilter, setSegmentFilter] = useState(null);

  const jobs = useMemo(
    () =>
      (Array.isArray(recentRuns) ? recentRuns : []).flatMap((run) =>
        childJobs(run).map((job) => ({
          ...job,
          run_id: job.run_id ?? run.id,
          scheduled_for: run.scheduled_for,
        })),
      ),
    [recentRuns],
  );

  const filteredJobs = useMemo(() => {
    if (!segmentFilter?.id) return jobs;
    return jobs.filter((job) => job.digest_segment === segmentFilter.id);
  }, [segmentFilter, jobs]);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Run status</CardTitle>
          <CardDescription>
            Scheduler timing and current BullMQ state.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Next run</div>
            <div className="mt-1 text-sm font-medium">
              {formatPacificDate(nextRunAt)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Last run</div>
            <div className="mt-1 text-sm font-medium">
              {formatFullDate(lastRunAt)}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 text-muted-foreground">Queue</div>
            <QueueSummary state={bullmqState} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent scheduled jobs</CardTitle>
          <CardDescription>
            Open a campaign job to review its selected businesses and delivery
            results.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-56 md:max-w-xs">
            <BusinessTierCombobox
              items={SEGMENT_FILTER_OPTIONS}
              value={segmentFilter}
              onValueChange={setSegmentFilter}
              placeholder="All digest campaigns"
              ariaLabel="Filter scheduled jobs by digest campaign"
              inputName="rrh-digest-schedule-segment"
            />
          </div>
          <IngestPayloadTable
            columns={JOB_COLUMNS}
            rows={filteredJobs}
            emptyMessage={
              segmentFilter
                ? "No scheduled jobs for this campaign."
                : "No scheduled jobs yet."
            }
            getRowKey={(row) => row.id}
            getRowClassName={(row) =>
              SEGMENT_BORDER_COLORS[row.digest_segment] ??
              "border-l-4 border-l-zinc-400"
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
