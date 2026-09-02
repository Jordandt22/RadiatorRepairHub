"use client";

import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessFeaturedBadge from "@/components/pages/businesses/BusinessFeaturedBadge";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
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

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatCtr(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

function ctrColorClass(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "text-muted-foreground";
  }
  const ctr = Number(value);
  if (ctr >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (ctr >= 4) return "text-teal-600 dark:text-teal-400";
  if (ctr >= 2) return "text-amber-600 dark:text-amber-400";
  if (ctr >= 1) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-500";
}

function parseSort(sort) {
  const value = String(sort || "impressions_desc");
  const match = value.match(
    /^(title|impressions|listing_clicks|ctr|page_views)_(asc|desc)$/,
  );
  if (!match) return { key: "impressions", direction: "desc" };
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

export function BusinessesAnalyticsTableSkeleton({ rows = 8 }) {
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Listing clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Page views</TableHead>
              <TableHead className="text-right">Phone</TableHead>
              <TableHead className="text-right">Directions</TableHead>
              <TableHead className="text-right">Website</TableHead>
              <TableHead className="text-right">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                {Array.from({ length: 8 }).map((__, cell) => (
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

export default function BusinessesAnalyticsTable({
  rows = [],
  sort = "impressions_desc",
  onSortChange,
}) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No businesses found</p>
        <p className="text-sm text-muted-foreground">
          Try a different search, filter, or period.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <BusinessTitleLink
              id={row.id}
              title={row.title}
              slug={row.slug}
              href={`/businesses/${row.id}?tab=analytics`}
              showSlug={false}
            />
            <div className="flex flex-wrap items-center gap-2">
              <BusinessClaimedBadge isClaimed={Boolean(row.is_claimed)} />
              {row.is_featured ? <BusinessFeaturedBadge isFeatured /> : null}
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Impressions</dt>
              <dd className="tabular-nums">{formatNumber(row.impressions)}</dd>
              <dt className="text-muted-foreground">Listing clicks</dt>
              <dd className="tabular-nums">{formatNumber(row.listing_clicks)}</dd>
              <dt className="text-muted-foreground">CTR</dt>
              <dd className={cn("tabular-nums", ctrColorClass(row.ctr))}>
                {formatCtr(row.ctr)}
              </dd>
              <dt className="text-muted-foreground">Page views</dt>
              <dd className="tabular-nums">{formatNumber(row.page_views)}</dd>
              <dt className="text-muted-foreground">Phone clicks</dt>
              <dd className="tabular-nums">{formatNumber(row.phone_clicks)}</dd>
              <dt className="text-muted-foreground">Directions clicks</dt>
              <dd className="tabular-nums">{formatNumber(row.directions_clicks)}</dd>
              <dt className="text-muted-foreground">Website clicks</dt>
              <dd className="tabular-nums">{formatNumber(row.website_clicks)}</dd>
              <dt className="text-muted-foreground">Email clicks</dt>
              <dd className="tabular-nums">{formatNumber(row.email_clicks)}</dd>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader
                columnKey="title"
                label="Business"
                sort={sort}
                onSortChange={onSortChange}
              />
              <TableHead>Status</TableHead>
              <SortHeader
                columnKey="impressions"
                label="Impressions"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="listing_clicks"
                label="Listing clicks"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="ctr"
                label="CTR"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="page_views"
                label="Page views"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <TableHead className="text-right">Phone</TableHead>
              <TableHead className="text-right">Directions</TableHead>
              <TableHead className="text-right">Website</TableHead>
              <TableHead className="text-right">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-0 font-medium">
                  <BusinessTitleLink
                    id={row.id}
                    title={row.title}
                    slug={row.slug}
                    href={`/businesses/${row.id}?tab=analytics`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <BusinessClaimedBadge isClaimed={Boolean(row.is_claimed)} />
                    {row.is_featured ? (
                      <BusinessFeaturedBadge isFeatured />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.impressions)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.listing_clicks)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    ctrColorClass(row.ctr),
                  )}
                >
                  {formatCtr(row.ctr)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.page_views)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.phone_clicks)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.directions_clicks)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.website_clicks)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.email_clicks)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
