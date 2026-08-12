"use client";

import { EyeIcon, MapPinnedIcon } from "lucide-react";
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
import IngestStatusBadge from "@/components/pages/add-businesses/IngestStatusBadge";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";

function ScrapeJobsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <MapPinnedIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No city scrapes</p>
        <p className="text-sm text-muted-foreground">
          Start a scrape to pull businesses from Google Maps for a list of
          cities. Each city becomes its own ingest group.
        </p>
      </div>
    </div>
  );
}

export default function ScrapeJobsTable({
  jobs = [],
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  if (!jobs.length) {
    return <ScrapeJobsEmptyState />;
  }

  const allSelected = jobs.every((row) => selectedIds.has(row.id));
  const someSelected = !allSelected && jobs.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex min-w-0 flex-col gap-2 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all scrapes"
              />
            </TableHead>
            <TableHead className="w-[14%]">Status</TableHead>
            <TableHead className="w-[24%]">Keyword</TableHead>
            <TableHead className="w-[12%]">Cities</TableHead>
            <TableHead className="w-[12%]">Completed</TableHead>
            <TableHead className="w-[12%]">Failed</TableHead>
            <TableHead className="w-[10%]">Max places</TableHead>
            <TableHead className="w-[16%]">Created</TableHead>
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
                    aria-label={`Select scrape ${row.id}`}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="truncate">{row.search_keyword}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {row.city_count ?? 0}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge
                    count={row.completed_cities ?? 0}
                    tone="success"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge
                    count={row.failed_cities ?? 0}
                    tone="danger"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {row.max_places ?? 0}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer opacity-0 transition-all duration-200 hover:scale-95 group-hover:opacity-100 focus-visible:scale-95 focus-visible:opacity-100"
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
