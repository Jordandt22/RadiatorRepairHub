import { Building2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BusinessReviewsBadge from "@/components/pages/businesses/BusinessReviewsBadge";
import BusinessScoreBadge from "@/components/pages/businesses/BusinessScoreBadge";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function ClaimedBusinessesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <Building2Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          No claimed businesses
        </p>
        <p className="text-sm text-muted-foreground">
          This user does not currently own any claimed listings.
        </p>
      </div>
    </div>
  );
}

function ClaimedBusinessesTableView({ businesses }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[32%]">Business</TableHead>
            <TableHead className="w-[22%]">Email</TableHead>
            <TableHead className="w-[14%]">Phone</TableHead>
            <TableHead className="w-[10%]">Score</TableHead>
            <TableHead className="w-[10%] text-right">Reviews</TableHead>
            <TableHead className="w-[12%]">Last edited</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="max-w-0 font-medium">
                <BusinessTitleLink
                  id={row.id}
                  title={row.title}
                  slug={row.slug}
                />
              </TableCell>
              <TableCell className="max-w-0">
                <span
                  className="block truncate text-sm"
                  title={row.email ?? undefined}
                >
                  {row.email ?? "—"}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {row.phone ?? "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <BusinessScoreBadge score={row.total_score} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <div className="flex justify-end">
                  <BusinessReviewsBadge count={row.reviews_count} />
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {formatFullDate(row.last_edited_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ClaimedBusinessesCardList({ businesses }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {businesses.map((row) => (
        <div
          key={row.id}
          className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
        >
          <div className="min-w-0">
            <BusinessTitleLink
              id={row.id}
              title={row.title}
              slug={row.slug}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <BusinessScoreBadge score={row.total_score} />
              <BusinessReviewsBadge count={row.reviews_count} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate">{row.email ?? "—"}</dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{row.phone ?? "—"}</dd>
            <dt className="text-muted-foreground">Last edited</dt>
            <dd>{formatFullDate(row.last_edited_at)}</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}

export default function UserClaimedBusinessesTable({ businesses = [] }) {
  if (!businesses.length) {
    return <ClaimedBusinessesEmptyState />;
  }

  return (
    <>
      <ClaimedBusinessesCardList businesses={businesses} />
      <ClaimedBusinessesTableView businesses={businesses} />
    </>
  );
}
