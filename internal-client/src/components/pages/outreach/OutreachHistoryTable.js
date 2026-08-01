import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import OutreachEmptyState from "@/components/pages/outreach/OutreachEmptyState";
import { OUTREACH_TYPE_LABELS } from "@/components/pages/outreach/outreachConstants";

function TypeBadge({ type }) {
  const label = OUTREACH_TYPE_LABELS[type] ?? type ?? "—";
  return (
    <Badge variant="outline" className="border-transparent bg-zinc-100 text-zinc-800">
      {label}
    </Badge>
  );
}

function HistoryTableView({ rows }) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.outreach_history_id}>
              <TableCell className="font-medium">
                <div className="flex flex-col gap-0.5">
                  <span>{row.business?.title ?? "—"}</span>
                  {row.business?.slug ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      /business/{row.business.slug}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <TypeBadge type={row.outreach_type} />
              </TableCell>
              <TableCell>
                <span className="text-sm">{row.recipient ?? "—"}</span>
              </TableCell>
              <TableCell>
                <span className="line-clamp-2 text-sm">
                  {row.subject ?? "—"}
                </span>
              </TableCell>
              <TableCell>{formatDate(row.sent_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function HistoryCardList({ rows }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => (
        <div
          key={row.outreach_history_id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">
                {row.business?.title ?? "—"}
              </p>
              {row.business?.slug ? (
                <p className="text-xs text-muted-foreground">
                  /business/{row.business.slug}
                </p>
              ) : null}
            </div>
            <TypeBadge type={row.outreach_type} />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted-foreground">Recipient</dt>
              <dd className="truncate">{row.recipient ?? "—"}</dd>
              <dt className="text-muted-foreground">Subject</dt>
              <dd className="line-clamp-2">{row.subject ?? "—"}</dd>
              <dt className="text-muted-foreground">Sent</dt>
              <dd>{formatDate(row.sent_at)}</dd>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OutreachHistoryTable({
  rows = [],
  hasFilters = false,
}) {
  if (!rows.length) {
    return (
      <OutreachEmptyState hasFilters={hasFilters} variant="history" />
    );
  }

  return (
    <>
      <HistoryCardList rows={rows} />
      <HistoryTableView rows={rows} />
    </>
  );
}
