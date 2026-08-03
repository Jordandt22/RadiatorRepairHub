"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import IngestStatusBadge from "@/components/pages/add-businesses/IngestStatusBadge";
import { resolveBatchColor, FILTER_JOB_COLOR } from "@/components/pages/add-businesses/batchColors";
import { cn } from "@/lib/utils";

const JOB_TYPE_CONFIG = {
  filter: {
    label: "Filter",
    className: "border-transparent bg-sky-100 text-sky-800",
  },
  enrich: {
    label: "Enrich",
    className: "border-transparent bg-orange-100 text-orange-800",
  },
  insert: {
    label: "Insert",
    className: "border-transparent bg-indigo-100 text-indigo-800",
  },
};

function IngestJobTypeBadge({ jobType }) {
  const config = JOB_TYPE_CONFIG[jobType] ?? {
    label: jobType
      ? jobType.charAt(0).toUpperCase() + jobType.slice(1)
      : "Unknown",
    className: "border-transparent bg-zinc-100 text-zinc-700",
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function shortId(id) {
  if (!id) return "—";
  return String(id).slice(0, 8);
}

export default function IngestJobsTable({ jobs = [], colorMap }) {
  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground">No jobs yet.</p>;
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[12%]">Type</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[16%]">Batch</TableHead>
            <TableHead className="w-[16%]">Started</TableHead>
            <TableHead className="w-[16%]">Finished</TableHead>
            <TableHead className="w-[28%]">Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const color =
              job.job_type === "filter"
                ? FILTER_JOB_COLOR
                : resolveBatchColor(job.batch_id, colorMap);
            return (
              <TableRow
                key={job.id}
                className={cn(color?.border && "border-l-4", color?.border)}
              >
                <TableCell className="whitespace-nowrap">
                  <IngestJobTypeBadge jobType={job.job_type} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestStatusBadge status={job.status} />
                </TableCell>
                <TableCell className="max-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    {color ? (
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          color.dot,
                        )}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span
                      className="block truncate text-muted-foreground"
                      title={job.batch_id || undefined}
                    >
                      {shortId(job.batch_id)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(job.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(job.completed_at || job.failed_at)}
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate text-destructive">
                    {job.failed_data?.message || "—"}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
