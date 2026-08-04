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
import IngestStatusBadge from "@/components/pages/add-businesses/IngestStatusBadge";
import IngestGroupsEmptyState from "@/components/pages/add-businesses/IngestGroupsEmptyState";

function IngestGroupsTableView({
  groups,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    groups.length > 0 && groups.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && groups.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={groups.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all groups"
              />
            </TableHead>
            <TableHead className="w-[28%]">Name</TableHead>
            <TableHead className="w-[14%]">Status</TableHead>
            <TableHead className="w-[12%]">Batches</TableHead>
            <TableHead className="w-[12%]">Jobs</TableHead>
            <TableHead className="w-[12%]">Inserted</TableHead>
            <TableHead className="w-[12%]">Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((row) => {
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
                    aria-label={`Select group ${row.name}`}
                  />
                </TableCell>
                <TableCell className="max-w-0 font-medium">
                  <span className="block truncate">{row.name}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.processing_batches}/{row.total_batches}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.running_jobs}/{row.total_jobs}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.inserted_count ?? 0}
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

function IngestGroupsCardList({
  groups,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    groups.length > 0 && groups.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && groups.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={groups.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all groups"
        />
        <span className="text-sm text-muted-foreground">
          {groups.length} {groups.length === 1 ? "group" : "groups"}
        </span>
      </div>
      {groups.map((row) => {
        const checked = selectedIds.has(row.id);
        return (
          <div
            key={row.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggleId(row.id, next === true)}
                aria-label={`Select group ${row.name}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.name}</p>
                <div className="mt-1.5">
                  <IngestStatusBadge status={row.status} />
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Batches</dt>
              <dd>
                {row.processing_batches}/{row.total_batches}
              </dd>
              <dt className="text-muted-foreground">Jobs</dt>
              <dd>
                {row.running_jobs}/{row.total_jobs}
              </dd>
              <dt className="text-muted-foreground">Inserted</dt>
              <dd>{row.inserted_count ?? 0}</dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(row.created_at)}</dd>
            </dl>
            <div className="pl-8">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => onViewClick(row)}
              >
                <EyeIcon />
                View
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function IngestGroupsTable({
  groups = [],
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  if (!groups.length) {
    return <IngestGroupsEmptyState />;
  }

  return (
    <>
      <IngestGroupsCardList
        groups={groups}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
      />
      <div className="hidden min-w-0 md:block">
        <IngestGroupsTableView
          groups={groups}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onViewClick={onViewClick}
        />
      </div>
    </>
  );
}
