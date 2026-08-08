import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ListingReportStatusBadge from "@/components/pages/listing-reports/ListingReportStatusBadge";

const REASON_LABELS = {
  wrong_claim_contact: "Wrong claim contact",
  incorrect_outdated: "Incorrect/outdated",
  inappropriate: "Inappropriate",
};

function reasonLabel(reason) {
  return REASON_LABELS[reason] ?? reason ?? "—";
}

export default function OverviewListingReportsTable({ listingReports = [] }) {
  if (!listingReports.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
        No listing reports yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {listingReports.map((row) => (
          <div
            key={row.listing_report_id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <BusinessTitleLink
              id={row.business?.id}
              title={row.business?.title}
              showSlug={false}
            />
            <ListingReportStatusBadge status={row.status} />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Reason</dt>
              <dd>{reasonLabel(row.reason)}</dd>
              <dt className="text-muted-foreground">Reporter</dt>
              <dd className="truncate">{row.reporter_email ?? "—"}</dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(row.created_at)}</dd>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[26%]">Business</TableHead>
              <TableHead className="w-[18%]">Reason</TableHead>
              <TableHead className="w-[24%]">Reporter</TableHead>
              <TableHead className="w-[14%]">Status</TableHead>
              <TableHead className="w-[18%]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listingReports.map((row) => (
              <TableRow key={row.listing_report_id}>
                <TableCell className="max-w-0 font-medium">
                  <BusinessTitleLink
                    id={row.business?.id}
                    title={row.business?.title}
                    showSlug={false}
                  />
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate">
                    {reasonLabel(row.reason)}
                  </span>
                </TableCell>
                <TableCell className="max-w-0">
                  <div className="min-w-0">
                    <span
                      className="block truncate text-sm"
                      title={row.reporter_email ?? undefined}
                    >
                      {row.reporter_email ?? "—"}
                    </span>
                    {row.reporter_name ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {row.reporter_name}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <ListingReportStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
