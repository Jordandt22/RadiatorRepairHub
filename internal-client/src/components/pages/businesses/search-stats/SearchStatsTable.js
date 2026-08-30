"use client";

import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  searchDemandLocationHref,
  useRowNavigate,
} from "@/components/pages/locations/LocationsTable";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function parseSort(sort) {
  const value = String(sort || "searches_desc");
  const match = value.match(
    /^(name|searches|zero_results|businesses|claimed|featured)_(asc|desc)$/,
  );
  if (!match) return { key: "searches", direction: "desc" };
  return { key: match[1], direction: match[2] };
}

function SortHeader({ columnKey, label, sort, onSortChange, align = "left" }) {
  const { key, direction } = parseSort(sort);
  const active = key === columnKey;
  const nextSort =
    active && direction === "desc" ? `${columnKey}_asc` : `${columnKey}_desc`;
  const Icon = !active
    ? ArrowUpDownIcon
    : direction === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSortChange?.(nextSort)}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 font-medium hover:text-foreground",
          align === "right" && "ml-auto",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon className="size-3.5" aria-hidden="true" />
      </button>
    </TableHead>
  );
}

function getZeroResultsPillClass(value) {
  return Number(value || 0) === 0
    ? "border-transparent bg-emerald-100 text-emerald-800"
    : "border-transparent bg-red-100 text-red-800";
}

function getBusinessCountPillClass(value) {
  const count = Number(value || 0);
  if (count <= 0) return "border-transparent bg-red-100 text-red-800";
  if (count < 10) return "border-transparent bg-orange-100 text-orange-800";
  if (count < 25) return "border-transparent bg-yellow-100 text-yellow-800";
  if (count < 100) return "border-transparent bg-sky-100 text-sky-800";
  return "border-transparent bg-emerald-100 text-emerald-800";
}

function CountPill({ value, className }) {
  return (
    <Badge
      variant="outline"
      className={cn("tabular-nums", className)}
    >
      {formatNumber(value)}
    </Badge>
  );
}

function ZeroResultsPill({ value }) {
  const count = Number(value || 0);
  return (
    <CountPill
      value={count}
      className={getZeroResultsPillClass(count)}
    />
  );
}

function BusinessCountPill({ value }) {
  const count = Number(value || 0);
  return (
    <CountPill
      value={count}
      className={getBusinessCountPillClass(count)}
    />
  );
}

function formatRowName(row, dimension) {
  if (dimension === "city" && row.state_code) {
    return `${row.name}, ${row.state_code}`;
  }
  if (dimension === "state" && row.code) {
    return `${row.name} (${row.code})`;
  }
  return row.name || "—";
}

function SearchStatsRow({ row, dimension }) {
  const href = searchDemandLocationHref(dimension, row);
  const nav = useRowNavigate(href);

  return (
    <TableRow {...nav}>
      <TableCell className="font-medium">
        {formatRowName(row, dimension)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatNumber(row.searches)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end">
          <ZeroResultsPill value={row.zero_result_searches} />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end">
          <BusinessCountPill value={row.business_count} />
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatNumber(row.claimed_count)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatNumber(row.featured_count)}
      </TableCell>
    </TableRow>
  );
}

function SearchStatsMobileCard({ row, dimension }) {
  const href = searchDemandLocationHref(dimension, row);
  const nav = useRowNavigate(href);

  return (
    <div
      {...nav}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-background p-4",
        nav.className,
      )}
    >
      <p className="font-medium text-foreground">
        {formatRowName(row, dimension)}
      </p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Searches</dt>
        <dd className="tabular-nums">{formatNumber(row.searches)}</dd>
        <dt className="text-muted-foreground">Zero results</dt>
        <dd>
          <ZeroResultsPill value={row.zero_result_searches} />
        </dd>
        <dt className="text-muted-foreground">Businesses</dt>
        <dd>
          <BusinessCountPill value={row.business_count} />
        </dd>
        <dt className="text-muted-foreground">Claimed</dt>
        <dd className="tabular-nums">{formatNumber(row.claimed_count)}</dd>
        <dt className="text-muted-foreground">Featured</dt>
        <dd className="tabular-nums">
          {formatNumber(row.featured_count)}
        </dd>
      </dl>
    </div>
  );
}

export function SearchStatsTableSkeleton({ rows = 8 }) {
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Searches</TableHead>
              <TableHead className="text-right">Zero results</TableHead>
              <TableHead className="text-right">Businesses</TableHead>
              <TableHead className="text-right">Claimed</TableHead>
              <TableHead className="text-right">Featured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                {Array.from({ length: 5 }).map((__, cell) => (
                  <TableCell key={cell} className="text-right">
                    <Skeleton className="ml-auto h-4 w-10" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default function SearchStatsTable({
  rows = [],
  dimension = "state",
  sort = "searches_desc",
  onSortChange,
}) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No search demand yet</p>
        <p className="text-sm text-muted-foreground">
          Searches will appear here after visitors use directory pages or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <SearchStatsMobileCard
            key={row.id}
            row={row}
            dimension={dimension}
          />
        ))}
      </div>

      <div className="hidden min-w-0 overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader
                columnKey="name"
                label="Name"
                sort={sort}
                onSortChange={onSortChange}
              />
              <SortHeader
                columnKey="searches"
                label="Searches"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="zero_results"
                label="Zero results"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="businesses"
                label="Businesses"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="claimed"
                label="Claimed"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="featured"
                label="Featured"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <SearchStatsRow
                key={row.id}
                row={row}
                dimension={dimension}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
