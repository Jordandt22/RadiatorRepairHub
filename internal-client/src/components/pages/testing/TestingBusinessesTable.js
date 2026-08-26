import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessFeaturedBadge from "@/components/pages/businesses/BusinessFeaturedBadge";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import TestingEmptyState from "@/components/pages/testing/TestingEmptyState";

function locationText(row) {
  const parts = [row.city_name, row.state_code].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function TestingBusinessesTable({
  businesses,
  hasSearch = false,
  onDelete,
  deletePending = false,
}) {
  if (!businesses.length) {
    return <TestingEmptyState tab="businesses" hasSearch={hasSearch} />;
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {businesses.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          >
            <BusinessTitleLink id={row.id} title={row.title} slug={row.slug} />
            <p className="text-sm text-muted-foreground">{locationText(row)}</p>
            <div className="flex flex-wrap items-center gap-2">
              <BusinessClaimedBadge isClaimed={row.is_claimed} />
              <BusinessFeaturedBadge isFeatured={row.is_featured} />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deletePending}
              onClick={() => onDelete(row)}
              className="w-fit cursor-pointer rounded-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2Icon />
              Delete
            </Button>
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Business</TableHead>
              <TableHead className="w-[16%]">Location</TableHead>
              <TableHead className="w-[16%]">Email</TableHead>
              <TableHead className="w-[12%]">Claimed</TableHead>
              <TableHead className="w-[12%]">Featured</TableHead>
              <TableHead className="w-[12%]">Created</TableHead>
              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((row) => (
              <TableRow key={row.id} className="group">
                <TableCell className="max-w-0 font-medium">
                  <BusinessTitleLink
                    id={row.id}
                    title={row.title}
                    slug={row.slug}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {locationText(row)}
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate text-sm" title={row.email ?? undefined}>
                    {row.email ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <BusinessClaimedBadge isClaimed={row.is_claimed} />
                </TableCell>
                <TableCell>
                  <BusinessFeaturedBadge isFeatured={row.is_featured} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatFullDate(row.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deletePending}
                    onClick={() => onDelete(row)}
                    className="cursor-pointer rounded-full border-destructive text-destructive opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
