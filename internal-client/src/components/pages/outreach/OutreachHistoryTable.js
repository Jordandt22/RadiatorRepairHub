import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MailIcon, MessageSquareTextIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import OutreachEmptyState from "@/components/pages/outreach/OutreachEmptyState";
import { OUTREACH_TYPE_LABELS } from "@/components/pages/outreach/outreachConstants";

const TYPE_BADGE_STYLES = {
  claim_invite: "border-transparent bg-sky-100 text-sky-800",
  ownership_claim_invite: "border-transparent bg-violet-100 text-violet-800",
  lead_claim_invite: "border-transparent bg-emerald-100 text-emerald-800",
  custom_claim_invite: "border-transparent bg-amber-100 text-amber-900",
  claim_followup: "border-transparent bg-indigo-100 text-indigo-800",
  website_offer: "border-transparent bg-rose-100 text-rose-800",
  sms_claim_invite: "border-transparent bg-cyan-100 text-cyan-800",
  sms_claim_followup: "border-transparent bg-blue-100 text-blue-800",
  sms_custom_claim_invite: "border-transparent bg-orange-100 text-orange-900",
  sms_declined: "border-transparent bg-red-100 text-red-800",
};

function TypeBadge({ type }) {
  const label = OUTREACH_TYPE_LABELS[type] ?? type ?? "—";
  const className =
    TYPE_BADGE_STYLES[type] ?? "border-transparent bg-zinc-100 text-zinc-800";
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function ChannelBadge({ messageType }) {
  const isSms = messageType === "phone";
  return (
    <Badge
      variant="outline"
      className={
        isSms
          ? "border-transparent bg-cyan-100 text-cyan-800"
          : "border-transparent bg-teal-100 text-teal-800"
      }
    >
      {isSms ? <MessageSquareTextIcon data-icon="inline-start" /> : <MailIcon data-icon="inline-start" />}
      {isSms ? "SMS" : "Email"}
    </Badge>
  );
}

/** SMS rows are texted to the listing phone, email rows go to the listing email. */
function currentContact(row) {
  return row.message_type === "phone"
    ? row.business?.phone
    : row.business?.email;
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
            <TableHead className="w-[19%]">Business</TableHead>
            <TableHead className="w-[11%]">Type</TableHead>
            <TableHead className="w-[8%]">Channel</TableHead>
            <TableHead className="w-[16%]">Sent to</TableHead>
            <TableHead className="w-[15%]">Current contact</TableHead>
            <TableHead className="w-[19%]">Subject</TableHead>
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
                <TableCell className="whitespace-nowrap">
                  <ChannelBadge messageType={row.message_type} />
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
                    title={currentContact(row) ?? undefined}
                  >
                    {currentContact(row) ?? "—"}
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
                <div className="flex flex-wrap items-center gap-1.5">
                  <TypeBadge type={row.outreach_type} />
                  <ChannelBadge messageType={row.message_type} />
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Sent to</dt>
                  <dd className="truncate">{row.recipient ?? "—"}</dd>
                  <dt className="text-muted-foreground">Current contact</dt>
                  <dd className="truncate">{currentContact(row) ?? "—"}</dd>
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
