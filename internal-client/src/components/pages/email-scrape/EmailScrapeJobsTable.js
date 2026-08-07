"use client";

import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import EmailScrapeStatusBadge from "@/components/pages/email-scrape/EmailScrapeStatusBadge";
import EmailScrapeEmptyState from "@/components/pages/email-scrape/EmailScrapeEmptyState";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";

function EmailScrapeJobsTableView({
  jobs,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    jobs.length > 0 && jobs.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && jobs.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={jobs.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all jobs"
              />
            </TableHead>
            <TableHead className="w-[14%]">Status</TableHead>
            <TableHead className="w-[10%]">Limit</TableHead>
            <TableHead className="w-[12%]">Batches</TableHead>
            <TableHead className="w-[10%]">Selected</TableHead>
            <TableHead className="w-[10%]">Succeeded</TableHead>
            <TableHead className="w-[10%]">Failed</TableHead>
            <TableHead className="w-[10%]">Skipped</TableHead>
            <TableHead className="w-[12%]">Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((row) => {
            const checked = selectedIds.has(row.id);
            return (
              <TableRow
                key={row.id}
                className="group"
                data-state={checked ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => onToggleId(row.id, next === true)}
                    aria-label={`Select job ${row.id}`}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <EmailScrapeStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {row.limit_count ?? 0}
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {row.completed_batches ?? 0}/{row.total_batches ?? 0}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge count={row.selected_count ?? 0} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge
                    count={row.succeeded_count ?? 0}
                    tone="success"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge
                    count={row.failed_count ?? 0}
                    tone="danger"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge count={row.skipped_count ?? 0} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 transition-all duration-200 group-hover:opacity-100 cursor-pointer hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                    onClick={() => onViewClick(row)}
                  >
                    <EyeIcon />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function EmailScrapeJobsCardList({
  jobs,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    jobs.length > 0 && jobs.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && jobs.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={jobs.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all jobs"
        />
        <span className="text-sm text-muted-foreground">Select all</span>
      </div>
      {jobs.map((row) => {
        const checked = selectedIds.has(row.id);
        return (
          <div
            key={row.id}
            className="rounded-lg border bg-background p-3 shadow-sm"
            data-state={checked ? "selected" : undefined}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggleId(row.id, next === true)}
                aria-label={`Select job ${row.id}`}
                className="mt-1"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <EmailScrapeStatusBadge status={row.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(row.created_at)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Limit {row.limit_count ?? 0}</span>
                  <span>
                    Batches {row.completed_batches ?? 0}/
                    {row.total_batches ?? 0}
                  </span>
                  <span>Selected {row.selected_count ?? 0}</span>
                  <span>OK {row.succeeded_count ?? 0}</span>
                  <span>Fail {row.failed_count ?? 0}</span>
                  <span>Skip {row.skipped_count ?? 0}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer"
                  onClick={() => onViewClick(row)}
                >
                  <EyeIcon />
                  View
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function EmailScrapeJobsTable({
  jobs = [],
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  if (!jobs.length) {
    return <EmailScrapeEmptyState />;
  }

  return (
    <>
      <EmailScrapeJobsCardList
        jobs={jobs}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
      />
      <div className="hidden min-w-0 md:block">
        <EmailScrapeJobsTableView
          jobs={jobs}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onViewClick={onViewClick}
        />
      </div>
    </>
  );
}
