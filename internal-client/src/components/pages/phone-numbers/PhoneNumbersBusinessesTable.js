"use client";

import Link from "next/link";
import { EyeIcon, PhoneIcon } from "lucide-react";
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
import PhoneCleanerStatusBadge from "@/components/pages/phone-cleaner/PhoneCleanerStatusBadge";
import PhoneLineTypeBadge from "@/components/pages/businesses/PhoneLineTypeBadge";

function PhoneNumbersEmptyState({ hasSearch = false }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <PhoneIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {hasSearch ? "No matches" : "No businesses found"}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasSearch
            ? "No businesses matched your search or phone filters. Try different keywords."
            : "Businesses will appear here once listings are available."}
        </p>
      </div>
    </div>
  );
}

function PhoneNumbersTableView({ businesses }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[24%]">Business</TableHead>
            <TableHead className="w-[16%]">Phone</TableHead>
            <TableHead className="w-[16%]">Line type</TableHead>
            <TableHead className="w-[16%]">Status</TableHead>
            <TableHead className="w-[16%]">Carrier</TableHead>
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
                <span className="block truncate text-sm">
                  {row.phone || "—"}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <PhoneLineTypeBadge row={row} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <PhoneCleanerStatusBadge status={row.phone_status} />
              </TableCell>
              <TableCell className="max-w-0">
                <span className="block truncate text-sm text-muted-foreground">
                  {row.phone_carrier || "—"}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-95 focus-visible:scale-95 focus-visible:opacity-100"
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

function PhoneNumbersCardList({ businesses }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {businesses.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border bg-background p-3 shadow-sm"
        >
          <div className="space-y-3">
            <BusinessTitleLink id={row.id} title={row.title} slug={row.slug} />
            <p className="text-sm">{row.phone || "—"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <PhoneLineTypeBadge row={row} />
              <PhoneCleanerStatusBadge status={row.phone_status} />
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {row.phone_carrier || "—"}
            </p>
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

export default function PhoneNumbersBusinessesTable({
  businesses = [],
  hasSearch = false,
}) {
  if (!businesses.length) {
    return <PhoneNumbersEmptyState hasSearch={hasSearch} />;
  }

  return (
    <>
      <PhoneNumbersCardList businesses={businesses} />
      <PhoneNumbersTableView businesses={businesses} />
    </>
  );
}
