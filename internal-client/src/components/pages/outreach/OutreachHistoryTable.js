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
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[24%]">Business</TableHead>
            <TableHead className="w-[14%]">Type</TableHead>
            <TableHead className="w-[22%]">Recipient</TableHead>
            <TableHead className="w-[26%]">Subject</TableHead>
            <TableHead className="w-[14%]">Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.outreach_history_id}>
              <TableCell className="max-w-0 font-medium">
                <div className="min-w-0">
                  <span className="block truncate">
                    {row.business?.title ?? "—"}
                  </span>
                  {row.business?.slug ? (
                    <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                      {row.business.slug}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <TypeBadge type={row.outreach_type} />
              </TableCell>
              <TableCell className="max-w-0">
                <span
                  className="block truncate text-sm"
                  title={row.recipient ?? undefined}
                >
                  {row.recipient ?? "—"}
                </span>
              </TableCell>
              <TableCell className="max-w-0">
                <span
                  className="block truncate text-sm"
                  title={row.subject ?? undefined}
                >
                  {row.subject ?? "—"}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(row.sent_at)}
              </TableCell>
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
                  {row.business.slug}
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
