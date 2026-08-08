import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import EmailCleanerEmptyState from "@/components/pages/email-cleaner/EmailCleanerEmptyState";
import EmailCleanerStatusBadge from "@/components/pages/email-cleaner/EmailCleanerStatusBadge";
import { formatDate } from "@/components/pages/dashboard/formatDate";

function MarkedAtCell({ markedAt }) {
  if (!markedAt) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return <span className="text-sm">{formatDate(markedAt)}</span>;
}

function EmailCleanerTableView({
  businesses,
  selectedIds,
  onToggleId,
  onToggleAll,
  onEditClick,
  showEdit = true,
}) {
  const allSelected =
    businesses.length > 0 &&
    businesses.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && businesses.some((row) => selectedIds.has(row.id));

  const businessWidth = showEdit ? "w-[24%]" : "w-[34%]";
  const emailWidth = showEdit ? "w-[22%]" : "w-[28%]";

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 min-w-10 max-w-10 pr-0">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={businesses.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all businesses"
              />
            </TableHead>
            <TableHead className={businessWidth}>Business</TableHead>
            <TableHead className={emailWidth}>Email</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[14%]">Status marked</TableHead>
            <TableHead className="w-[10%] text-right">Emails sent</TableHead>
            {showEdit ? (
              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((row) => {
            const id = row.id;
            const checked = selectedIds.has(id);
            return (
              <TableRow
                key={id}
                className="group"
                data-state={checked ? "selected" : undefined}
              >
                <TableCell className="w-10 min-w-10 max-w-10 pr-0">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => onToggleId(id, next === true)}
                    aria-label={`Select ${row.title ?? "business"}`}
                  />
                </TableCell>
                <TableCell className={`max-w-0 font-medium ${businessWidth}`}>
                  <BusinessTitleLink
                    id={row.id}
                    title={row.title}
                    slug={row.slug}
                  />
                </TableCell>
                <TableCell className={`max-w-0 ${emailWidth}`}>
                  <span
                    className="block truncate text-sm"
                    title={row.email ?? undefined}
                  >
                    {row.email ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <EmailCleanerStatusBadge status={row.email_status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <MarkedAtCell markedAt={row.email_status_marked_at} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {row.emails_sent_count ?? 0}
                </TableCell>
                {showEdit ? (
                  <TableCell className="w-24 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                      onClick={() => onEditClick(row)}
                    >
                      <PencilIcon />
                      Edit
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function EmailCleanerCardList({
  businesses,
  selectedIds,
  onToggleId,
  onToggleAll,
  onEditClick,
  showEdit = true,
}) {
  const allSelected =
    businesses.length > 0 &&
    businesses.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && businesses.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={businesses.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all businesses"
        />
        <span className="text-sm text-muted-foreground">
          {businesses.length}{" "}
          {businesses.length === 1 ? "business" : "businesses"}
        </span>
      </div>
      {businesses.map((row) => {
        const id = row.id;
        const checked = selectedIds.has(id);
        return (
          <div
            key={id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggleId(id, next === true)}
                aria-label={`Select ${row.title ?? "business"}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <BusinessTitleLink
                  id={row.id}
                  title={row.title}
                  slug={row.slug}
                />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{row.email ?? "—"}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <EmailCleanerStatusBadge status={row.email_status} />
              </dd>
              <dt className="text-muted-foreground">Status marked</dt>
              <dd>
                <MarkedAtCell markedAt={row.email_status_marked_at} />
              </dd>
              <dt className="text-muted-foreground">Emails sent</dt>
              <dd className="tabular-nums">{row.emails_sent_count ?? 0}</dd>
            </dl>
            {showEdit ? (
              <div className="pl-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => onEditClick(row)}
                >
                  <PencilIcon />
                  Edit
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function EmailCleanerTable({
  businesses = [],
  selectedIds,
  onToggleId,
  onToggleAll,
  onEditClick,
  hasSearch = false,
  hasFilters = false,
  showEdit = true,
  emptyVariant = "cleaner",
}) {
  if (!businesses.length) {
    return (
      <EmailCleanerEmptyState
        hasSearch={hasSearch}
        hasFilters={hasFilters}
        variant={emptyVariant}
      />
    );
  }

  return (
    <>
      <EmailCleanerCardList
        businesses={businesses}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onEditClick={onEditClick}
        showEdit={showEdit}
      />
      <div className="hidden min-w-0 md:block">
        <EmailCleanerTableView
          businesses={businesses}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onEditClick={onEditClick}
          showEdit={showEdit}
        />
      </div>
    </>
  );
}
