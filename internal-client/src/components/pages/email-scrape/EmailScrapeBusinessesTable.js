"use client";

import Link from "next/link";
import { EyeIcon, MailSearchIcon } from "lucide-react";
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

function WebsiteCell({ website }) {
  if (!website) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <a
      href={website}
      target="_blank"
      rel="noreferrer"
      className="block max-w-56 truncate text-sm text-sky-700 underline-offset-2 hover:underline"
      title={website}
    >
      {website}
    </a>
  );
}

function EmailCell({ email }) {
  if (!email) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <a
      href={`mailto:${email}`}
      className="block max-w-48 truncate text-sm text-sky-700 underline-offset-2 hover:underline"
      title={email}
    >
      {email}
    </a>
  );
}

function EmailScrapeBusinessesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <MailSearchIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No businesses found</p>
        <p className="text-sm text-muted-foreground">
          Try a different search or email / attempts filter.
        </p>
      </div>
    </div>
  );
}

function EmailScrapeBusinessesTableView({ businesses }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Business</TableHead>
            <TableHead className="w-[26%]">Website</TableHead>
            <TableHead className="w-[24%]">Email</TableHead>
            <TableHead className="w-[10%]">Attempts</TableHead>
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
              <TableCell className="max-w-0">
                <WebsiteCell website={row.website} />
              </TableCell>
              <TableCell className="max-w-0">
                <EmailCell email={row.email} />
              </TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">
                {row.email_scraped_attempts ?? 0}
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

function EmailScrapeBusinessesCardList({ businesses }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {businesses.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border bg-background p-3 shadow-sm"
        >
          <div className="space-y-3">
            <BusinessTitleLink id={row.id} title={row.title} slug={row.slug} />
            <WebsiteCell website={row.website} />
            <EmailCell email={row.email} />
            <span className="text-xs text-muted-foreground">
              Attempts {row.email_scraped_attempts ?? 0}
            </span>
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

export default function EmailScrapeBusinessesTable({ businesses = [] }) {
  if (!businesses.length) {
    return <EmailScrapeBusinessesEmptyState />;
  }

  return (
    <>
      <EmailScrapeBusinessesCardList businesses={businesses} />
      <EmailScrapeBusinessesTableView businesses={businesses} />
    </>
  );
}
