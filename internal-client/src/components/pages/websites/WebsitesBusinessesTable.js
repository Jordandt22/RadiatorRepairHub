"use client";

import Link from "next/link";
import { EyeIcon, GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import BusinessScoreBadge from "@/components/pages/businesses/BusinessScoreBadge";
import BusinessReviewsBadge from "@/components/pages/businesses/BusinessReviewsBadge";

function websiteHref(website) {
  const trimmed = String(website || "").trim();
  if (!trimmed) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function WebsiteCell({ website }) {
  const href = websiteHref(website);
  if (!href) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block max-w-56 truncate text-sm text-sky-700 underline-offset-2 hover:underline"
      title={website}
    >
      {website}
    </a>
  );
}

function WebsitesBusinessesEmptyState({ hasSearch = false }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <GlobeIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {hasSearch ? "No matches" : "No businesses found"}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasSearch
            ? "No businesses matched your search or website filter. Try different keywords."
            : "Businesses will appear here once listings are available."}
        </p>
      </div>
    </div>
  );
}

function WebsitesBusinessesTableView({ businesses }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[32%]">Business</TableHead>
            <TableHead className="w-[10%]">Score</TableHead>
            <TableHead className="w-[10%] text-right">Reviews</TableHead>
            <TableHead className="w-[36%]">Website</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((row) => (
            <TableRow key={row.id} className="group">
              <TableCell className="max-w-0">
                <BusinessTitleLink
                  id={row.id}
                  title={row.title}
                  slug={row.slug}
                />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <BusinessScoreBadge score={row.total_score} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <div className="flex justify-end">
                  <BusinessReviewsBadge count={row.reviews_count} />
                </div>
              </TableCell>
              <TableCell className="max-w-0">
                <WebsiteCell website={row.website} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="opacity-0 transition-all duration-200 group-hover:opacity-100 cursor-pointer hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/businesses/${row.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <EyeIcon />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function WebsitesBusinessesCardList({ businesses }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {businesses.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border bg-background p-3 shadow-sm"
        >
          <div className="space-y-3">
            <BusinessTitleLink id={row.id} title={row.title} slug={row.slug} />
            <div className="flex flex-wrap items-center gap-2">
              <BusinessScoreBadge score={row.total_score} />
              <BusinessReviewsBadge count={row.reviews_count} />
            </div>
            <WebsiteCell website={row.website} />
            <Button
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
              nativeButton={false}
              render={
                <Link
                  href={`/businesses/${row.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <EyeIcon />
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WebsitesBusinessesTable({
  businesses = [],
  hasSearch = false,
}) {
  if (!businesses.length) {
    return <WebsitesBusinessesEmptyState hasSearch={hasSearch} />;
  }

  return (
    <>
      <WebsitesBusinessesCardList businesses={businesses} />
      <WebsitesBusinessesTableView businesses={businesses} />
    </>
  );
}
