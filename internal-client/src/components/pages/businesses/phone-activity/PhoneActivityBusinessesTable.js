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

function parseSort(sort) {
  const value = String(sort || "phone_clicks_desc");
  const match = value.match(
    /^(title|phone_clicks|impressions|page_views)_(asc|desc)$/,
  );
  if (!match) return { key: "phone_clicks", direction: "desc" };
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

export function PhoneActivityBusinessesSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Phone clicks</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">Page views</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              {Array.from({ length: 3 }).map((__, cell) => (
                <TableCell key={cell} className="text-right">
                  <Skeleton className="ml-auto h-4 w-10" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PhoneActivityBusinessesTable({
  rows = [],
  sort = "phone_clicks_desc",
  onSortChange,
}) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No businesses with phone clicks
        </p>
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
              <dt className="text-muted-foreground">Phone clicks</dt>
              <dd className="tabular-nums font-medium">
                {formatNumber(row.phone_clicks)}
              </dd>
              <dt className="text-muted-foreground">Impressions</dt>
              <dd className="tabular-nums">{formatNumber(row.impressions)}</dd>
              <dt className="text-muted-foreground">Page views</dt>
              <dd className="tabular-nums">{formatNumber(row.page_views)}</dd>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-border md:block">
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
                columnKey="phone_clicks"
                label="Phone clicks"
                sort={sort}
                onSortChange={onSortChange}
                align="right"
              />
              <SortHeader
                columnKey="impressions"
                label="Impressions"
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
                <TableCell className="text-right tabular-nums font-medium">
                  {formatNumber(row.phone_clicks)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.impressions)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.page_views)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
