import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="flex flex-col gap-2">
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
            <TableHead>Business</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Eligibility</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Claim invite</TableHead>
            <TableHead>Website offer</TableHead>
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
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-0.5">
                    <span>{row.title ?? "—"}</span>
                    {row.slug ? (
                      <span className="text-xs font-normal text-muted-foreground">
                        /business/{row.slug}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{row.email ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <ClaimEligibilityBadge eligibility={row.claim_eligibility} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {hasWebsiteValue(row.website) ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>
                  <SentCell sentAt={row.claim_invite_sent_at} />
                </TableCell>
                <TableCell>
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
                <div>
                  <p className="text-sm font-medium">{row.title ?? "—"}</p>
                  {row.slug ? (
                    <p className="text-xs text-muted-foreground">
                      /business/{row.slug}
                    </p>
                  ) : null}
                </div>
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
      <div className="hidden md:block">
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
