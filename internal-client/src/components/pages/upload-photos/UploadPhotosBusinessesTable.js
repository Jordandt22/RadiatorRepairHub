"use client";

import Link from "next/link";
import { EyeIcon, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";

function CdnStoredBadge({ stored }) {
  if (stored) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-emerald-100 text-emerald-800"
      >
        Yes
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-700"
    >
      No
    </Badge>
  );
}

function ImageUrlCell({ url }) {
  if (!url) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block max-w-56 truncate text-sm text-sky-700 underline-offset-2 hover:underline"
      title={url}
    >
      {url}
    </a>
  );
}

function UploadPhotosBusinessesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <ImageIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No businesses found</p>
        <p className="text-sm text-muted-foreground">
          Try a different search or CDN stored filter.
        </p>
      </div>
    </div>
  );
}

function UploadPhotosBusinessesTableView({ businesses }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Title</TableHead>
            <TableHead className="w-[12%]">CDN stored</TableHead>
            <TableHead className="w-[10%]">Attempts</TableHead>
            <TableHead className="w-[16%]">Created</TableHead>
            <TableHead className="w-[24%]">Image URL</TableHead>
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
                <CdnStoredBadge stored={Boolean(row.cdn_stored)} />
              </TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">
                {row.cdn_stored_attempts ?? 0}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(row.created_at)}
              </TableCell>
              <TableCell className="max-w-0">
                <ImageUrlCell url={row.image_url} />
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

function UploadPhotosBusinessesCardList({ businesses }) {
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
              <CdnStoredBadge stored={Boolean(row.cdn_stored)} />
              <span className="text-xs text-muted-foreground">
                Attempts {row.cdn_stored_attempts ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(row.created_at)}
              </span>
            </div>
            <ImageUrlCell url={row.image_url} />
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

export default function UploadPhotosBusinessesTable({ businesses = [] }) {
  if (!businesses.length) {
    return <UploadPhotosBusinessesEmptyState />;
  }

  return (
    <>
      <UploadPhotosBusinessesCardList businesses={businesses} />
      <UploadPhotosBusinessesTableView businesses={businesses} />
    </>
  );
}
