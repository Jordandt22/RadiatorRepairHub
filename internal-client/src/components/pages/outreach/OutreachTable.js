import { Checkbox } from "@/components/ui/checkbox";
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
import ClaimEligibilityBadge from "@/components/pages/outreach/ClaimEligibilityBadge";
import OutreachEmptyState from "@/components/pages/outreach/OutreachEmptyState";
import { OUTREACH_SEND_SELECTION_CAP } from "@/components/pages/outreach/outreachConstants";

function hasWebsiteValue(website) {
  return typeof website === "string" && website.trim().length > 0;
}

function SentCell({ sentAt }) {
  if (!sentAt) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return <span className="text-sm">{formatDate(sentAt)}</span>;
}

function OutreachTableView({
  businesses,
  selectable,
  selectedIds,
  onToggleId,
  onTogglePage,
  selectionCap,
}) {
  const pageIds = businesses.map((row) => row.id);
  const selectedOnPage = selectable
    ? pageIds.filter((id) => selectedIds.has(id))
    : [];
  const allSelected =
    selectable &&
    pageIds.length > 0 &&
    selectedOnPage.length === pageIds.length;
  const someSelected =
    selectable && !allSelected && selectedOnPage.length > 0;
  const atCap = selectable && selectedIds.size >= selectionCap;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={businesses.length === 0}
                  onCheckedChange={(checked) => onTogglePage(checked === true)}
                  aria-label="Select all on page"
                />
              </TableHead>
            ) : null}
            <TableHead className="w-[28%]">Business</TableHead>
            <TableHead className="w-[20%]">Email</TableHead>
            <TableHead className="w-[12%]">Eligibility</TableHead>
            <TableHead className="w-[8%]">Website</TableHead>
            <TableHead className="w-[11%]">Claim invite</TableHead>
            <TableHead className="w-[11%]">Follow-up</TableHead>
            <TableHead className="w-[10%]">Website offer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((row) => {
            const id = row.id;
            const checked = selectable ? selectedIds.has(id) : false;
            const disableSelect = selectable && !checked && atCap;
            return (
              <TableRow
                key={id}
                data-state={checked ? "selected" : undefined}
              >
                {selectable ? (
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      disabled={disableSelect}
                      onCheckedChange={(next) =>
                        onToggleId(id, next === true)
                      }
                      aria-label={`Select ${row.title ?? "business"}`}
                    />
                  </TableCell>
                ) : null}
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
                <TableCell className="whitespace-nowrap">
                  <ClaimEligibilityBadge eligibility={row.claim_eligibility} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="text-sm">
                    {hasWebsiteValue(row.website) ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <SentCell sentAt={row.claim_invite_sent_at} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <SentCell sentAt={row.claim_followup_sent_at} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <SentCell sentAt={row.website_offer_sent_at} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function OutreachCardList({
  businesses,
  selectable,
  selectedIds,
  onToggleId,
  selectionCap,
}) {
  const atCap = selectable && selectedIds.size >= selectionCap;

  return (
    <div className="flex flex-col gap-3">
      {businesses.map((row) => {
        const id = row.id;
        const checked = selectable ? selectedIds.has(id) : false;
        const disableSelect = selectable && !checked && atCap;
        return (
          <div
            key={id}
            className="rounded-lg border border-border bg-card p-4"
            data-state={checked ? "selected" : undefined}
          >
            <div className="flex items-start gap-3">
              {selectable ? (
                <Checkbox
                  checked={checked}
                  disabled={disableSelect}
                  onCheckedChange={(next) => onToggleId(id, next === true)}
                  aria-label={`Select ${row.title ?? "business"}`}
                  className="mt-0.5"
                />
              ) : null}
              <div className="min-w-0 flex-1 space-y-2">
                <BusinessTitleLink
                  id={row.id}
                  title={row.title}
                  slug={row.slug}
                />
                <ClaimEligibilityBadge eligibility={row.claim_eligibility} />
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate">{row.email ?? "—"}</dd>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>{hasWebsiteValue(row.website) ? "Yes" : "No"}</dd>
                  <dt className="text-muted-foreground">Claim invite</dt>
                  <dd>
                    {row.claim_invite_sent_at
                      ? formatDate(row.claim_invite_sent_at)
                      : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Follow-up</dt>
                  <dd>
                    {row.claim_followup_sent_at
                      ? formatDate(row.claim_followup_sent_at)
                      : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Website offer</dt>
                  <dd>
                    {row.website_offer_sent_at
                      ? formatDate(row.website_offer_sent_at)
                      : "—"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OutreachTable({
  businesses = [],
  selectable = false,
  selectedIds,
  onToggleId,
  onTogglePage,
  hasFilters = false,
  emptyVariant = "browse",
  selectionCap = OUTREACH_SEND_SELECTION_CAP,
  sectionTitle = null,
  hideEmpty = false,
}) {
  if (!businesses.length) {
    if (hideEmpty) return null;
    return (
      <OutreachEmptyState hasFilters={hasFilters} variant={emptyVariant} />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sectionTitle ? (
        <h2 className="text-sm font-medium text-foreground">
          {sectionTitle}
          <span className="ml-1.5 font-normal text-muted-foreground">
            ({businesses.length})
          </span>
        </h2>
      ) : null}
      <div className="md:hidden">
        <OutreachCardList
          businesses={businesses}
          selectable={selectable}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          selectionCap={selectionCap}
        />
      </div>
      <div className="hidden min-w-0 md:block">
        <OutreachTableView
          businesses={businesses}
          selectable={selectable}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onTogglePage={onTogglePage}
          selectionCap={selectionCap}
        />
      </div>
    </div>
  );
}
