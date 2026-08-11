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

const CAMPAIGN_FILTER_OPTIONS = [
  { id: "claim_invite", label: "Claim Invite" },
  { id: "ownership_claim_invite", label: "Ownership Claim Invite" },
  { id: "lead_claim_invite", label: "Lead Claim Invite" },
  { id: "claim_followup", label: "Claim Follow-up" },
];

const CAMPAIGN_LABELS = {
  claim_invite: "Claim Invite",
  ownership_claim_invite: "Ownership Claim Invite",
  lead_claim_invite: "Lead Claim Invite",
  claim_followup: "Claim Follow-up",
};

const CAMPAIGN_BORDER_COLORS = {
  claim_invite: "border-l-4 border-l-sky-400",
  ownership_claim_invite: "border-l-4 border-l-violet-400",
  lead_claim_invite: "border-l-4 border-l-emerald-400",
  claim_followup: "border-l-4 border-l-amber-400",
};

function formatPacificDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZoneName: "short",
  });
}

function statusVariant(status) {
  if (status === "failed") return "destructive";
  if (status === "completed") return "secondary";
  return "outline";
}

function childJobs(run) {
  if (Array.isArray(run?.outreach_send_jobs)) return run.outreach_send_jobs;
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
        href={`/outreach/schedule/${row.id}`}
        className="font-semibold hover:underline"
      >
        {CAMPAIGN_LABELS[row.outreach_type] ?? row.outreach_type ?? "—"}
      </Link>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
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
        render={<Link href={`/outreach/schedule/${row.id}`} />}
      >
        <EyeIcon />
        View
      </Button>
    ),
  },
];

export default function OutreachScheduleRuns({
  nextRunAt,
  lastRunAt,
  bullmqState,
  recentRuns,
}) {
  const [campaignFilter, setCampaignFilter] = useState(null);

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
    if (!campaignFilter?.id) return jobs;
    return jobs.filter((job) => job.outreach_type === campaignFilter.id);
  }, [campaignFilter, jobs]);

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
              items={CAMPAIGN_FILTER_OPTIONS}
              value={campaignFilter}
              onValueChange={setCampaignFilter}
              placeholder="All email types"
              ariaLabel="Filter scheduled jobs by email type"
              inputName="rrh-schedule-campaign-type"
            />
          </div>
          <IngestPayloadTable
            columns={JOB_COLUMNS}
            rows={filteredJobs}
            emptyMessage={
              campaignFilter
                ? "No scheduled jobs for this email type."
                : "No scheduled jobs yet."
            }
            getRowKey={(row) => row.id}
            getRowClassName={(row) =>
              CAMPAIGN_BORDER_COLORS[row.outreach_type] ??
              "border-l-4 border-l-zinc-400"
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
