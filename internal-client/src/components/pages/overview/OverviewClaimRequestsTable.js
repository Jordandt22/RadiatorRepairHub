import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ClaimRequestStatusBadge from "@/components/pages/claim-requests/ClaimRequestStatusBadge";

export default function OverviewClaimRequestsTable({ claimRequests = [] }) {
  if (!claimRequests.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
        No claim requests yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {claimRequests.map((row) => (
          <div
            key={row.claim_request_id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <p className="font-medium">{row.business?.title ?? "—"}</p>
            <ClaimRequestStatusBadge status={row.status} />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Attempts</dt>
              <dd>{row.attempts ?? 0}</dd>
              <dt className="text-muted-foreground">Last Attempted</dt>
              <dd>{formatDate(row.last_attempted_at)}</dd>
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
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Last Attempted</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claimRequests.map((row) => (
              <TableRow key={row.claim_request_id}>
                <TableCell className="font-medium">
                  {row.business?.title ?? "—"}
                </TableCell>
                <TableCell>
                  <ClaimRequestStatusBadge status={row.status} />
                </TableCell>
                <TableCell>{row.attempts ?? 0}</TableCell>
                <TableCell>{formatDate(row.last_attempted_at)}</TableCell>
                <TableCell>{formatDate(row.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
