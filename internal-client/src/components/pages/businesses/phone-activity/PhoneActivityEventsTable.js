"use client";

import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessFeaturedBadge from "@/components/pages/businesses/BusinessFeaturedBadge";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import { formatPhoneClickTimestamp } from "@/lib/businessStats/formatStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function locationLabel(business) {
  const city = business?.city?.name;
  const state = business?.state?.code || business?.state?.name;
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return "—";
}

export function PhoneActivityEventsSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PhoneActivityEventsTable({ rows = [] }) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No phone clicks</p>
        <p className="text-sm text-muted-foreground">
          No phone click events in this period for the current filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => {
          const business = row.business || {};
          return (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
            >
              <time
                className="text-sm text-muted-foreground"
                dateTime={row.createdAt || undefined}
              >
                {formatPhoneClickTimestamp(row.createdAt)}
              </time>
              <BusinessTitleLink
                id={business.id}
                title={business.title}
                slug={business.slug}
                href={`/businesses/${business.id}?tab=analytics`}
                showSlug={false}
              />
              <p className="text-sm text-muted-foreground">
                {locationLabel(business)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <BusinessClaimedBadge isClaimed={Boolean(business.is_claimed)} />
                {business.is_featured ? <BusinessFeaturedBadge isFeatured /> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const business = row.business || {};
              return (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <time dateTime={row.createdAt || undefined}>
                      {formatPhoneClickTimestamp(row.createdAt)}
                    </time>
                  </TableCell>
                  <TableCell className="max-w-0 font-medium">
                    <BusinessTitleLink
                      id={business.id}
                      title={business.title}
                      slug={business.slug}
                      href={`/businesses/${business.id}?tab=analytics`}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {locationLabel(business)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <BusinessClaimedBadge
                        isClaimed={Boolean(business.is_claimed)}
                      />
                      {business.is_featured ? (
                        <BusinessFeaturedBadge isFeatured />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
