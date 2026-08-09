import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ListingRequestStatusBadge from "@/components/pages/get-listed-requests/ListingRequestStatusBadge";

export default function OverviewListingRequestsTable({
  listingRequests = [],
}) {
  if (!listingRequests.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
        No get listed requests yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {listingRequests.map((row) => (
          <div
            key={row.listing_request_id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <p className="font-medium">{row.business_name || "—"}</p>
            <ListingRequestStatusBadge status={row.status} />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{row.email ?? "—"}</dd>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="truncate">{row.phone || "—"}</dd>
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
              <TableHead className="w-[24%]">Business</TableHead>
              <TableHead className="w-[24%]">Email</TableHead>
              <TableHead className="w-[16%]">Phone</TableHead>
              <TableHead className="w-[14%]">Status</TableHead>
              <TableHead className="w-[22%]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listingRequests.map((row) => (
              <TableRow key={row.listing_request_id}>
                <TableCell className="max-w-0 font-medium">
                  <span className="block truncate">
                    {row.business_name || "—"}
                  </span>
                </TableCell>
                <TableCell className="max-w-0">
                  <span
                    className="block truncate text-sm"
                    title={row.email ?? undefined}
                  >
                    {row.email ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate">{row.phone || "—"}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <ListingRequestStatusBadge status={row.status} />
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
