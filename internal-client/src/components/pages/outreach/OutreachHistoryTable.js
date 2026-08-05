import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
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

function HistoryTableView({
  rows,
  selectedIds,
  onToggleId,
  onTogglePage,
}) {
  const pageIds = rows.map((row) => row.outreach_history_id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));
  const allSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someSelected = !allSelected && selectedOnPage.length > 0;

  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={rows.length === 0}
                onCheckedChange={(checked) => onTogglePage?.(checked === true)}
                aria-label="Select all on page"
              />
            </TableHead>
            <TableHead className="w-[20%]">Business</TableHead>
            <TableHead className="w-[12%]">Type</TableHead>
            <TableHead className="w-[18%]">Sent to</TableHead>
            <TableHead className="w-[16%]">Current email</TableHead>
            <TableHead className="w-[20%]">Subject</TableHead>
            <TableHead className="w-[12%]">Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = row.outreach_history_id;
            const checked = selectedIds.has(id);
            return (
              <TableRow
                key={id}
                data-state={checked ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) =>
                      onToggleId?.(id, next === true)
                    }
                    aria-label={`Select ${row.business?.title ?? "history row"}`}
                  />
                </TableCell>
                <TableCell className="max-w-0 font-medium">
                  <BusinessTitleLink
                    id={row.business?.id ?? row.business_id}
                    title={row.business?.title}
                    slug={row.business?.slug}
                  />
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
                    title={row.business?.email ?? undefined}
                  >
                    {row.business?.email ?? "—"}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function HistoryCardList({ rows, selectedIds, onToggleId }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => {
        const id = row.outreach_history_id;
        const checked = selectedIds.has(id);
        return (
          <div
            key={id}
            className="rounded-lg border border-border bg-card p-4"
            data-state={checked ? "selected" : undefined}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggleId?.(id, next === true)}
                aria-label={`Select ${row.business?.title ?? "history row"}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <BusinessTitleLink
                  id={row.business?.id ?? row.business_id}
                  title={row.business?.title}
                  slug={row.business?.slug}
                />
                <TypeBadge type={row.outreach_type} />
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Sent to</dt>
                  <dd className="truncate">{row.recipient ?? "—"}</dd>
                  <dt className="text-muted-foreground">Current email</dt>
                  <dd className="truncate">{row.business?.email ?? "—"}</dd>
                  <dt className="text-muted-foreground">Subject</dt>
                  <dd className="line-clamp-2">{row.subject ?? "—"}</dd>
                  <dt className="text-muted-foreground">Sent</dt>
                  <dd>{formatDate(row.sent_at)}</dd>
                </dl>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OutreachHistoryTable({
  rows = [],
  hasFilters = false,
  selectedIds = new Set(),
  onToggleId,
  onTogglePage,
}) {
  if (!rows.length) {
    return (
      <OutreachEmptyState hasFilters={hasFilters} variant="history" />
    );
  }

  return (
    <>
      <HistoryCardList
        rows={rows}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
      />
      <HistoryTableView
        rows={rows}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onTogglePage={onTogglePage}
      />
    </>
  );
}
