"use client";

import { EyeIcon, PhoneIcon } from "lucide-react";
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
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import PhoneLineTypeStatusBadge from "@/components/pages/phone-line-type/PhoneLineTypeStatusBadge";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <PhoneIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No line type jobs</p>
        <p className="text-sm text-muted-foreground">
          Start a check to look up Twilio line type for businesses that have a
          phone number and have not been checked yet.
        </p>
      </div>
    </div>
  );
}

function JobsTableView({
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
            <TableHead className="w-[16%]">Status</TableHead>
            <TableHead className="w-[12%]">Limit</TableHead>
            <TableHead className="w-[12%]">Selected</TableHead>
            <TableHead className="w-[12%]">Succeeded</TableHead>
            <TableHead className="w-[12%]">Failed</TableHead>
            <TableHead className="w-[12%]">Skipped</TableHead>
            <TableHead className="w-[14%]">Created</TableHead>
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
                  <PhoneLineTypeStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {row.limit_count ?? 0}
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
                    className="cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-95 focus-visible:scale-95 focus-visible:opacity-100"
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

function JobsCardList({
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
                  <PhoneLineTypeStatusBadge status={row.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(row.created_at)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Limit {row.limit_count ?? 0}</span>
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

export default function PhoneLineTypeJobsTable({
  jobs = [],
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  if (!jobs.length) {
    return <EmptyState />;
  }

  return (
    <>
      <JobsCardList
        jobs={jobs}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
      />
      <div className="hidden min-w-0 md:block">
        <JobsTableView
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
