import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ListingReportStatusBadge from "@/components/pages/listing-reports/ListingReportStatusBadge";

const REASON_LABELS = {
  wrong_claim_contact: "Wrong claim contact",
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
            <p className="font-medium">{row.business?.title ?? "—"}</p>
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

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listingReports.map((row) => (
              <TableRow key={row.listing_report_id}>
                <TableCell className="font-medium">
                  {row.business?.title ?? "—"}
                </TableCell>
                <TableCell>{reasonLabel(row.reason)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{row.reporter_email ?? "—"}</span>
                    {row.reporter_name ? (
                      <span className="text-xs text-muted-foreground">
                        {row.reporter_name}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <ListingReportStatusBadge status={row.status} />
                </TableCell>
                <TableCell>{formatDate(row.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
