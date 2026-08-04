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

function EmailCleanerTableView({
  businesses,
  selectedIds,
  onToggleId,
  onToggleAll,
  onEditClick,
}) {
  const allSelected =
    businesses.length > 0 &&
    businesses.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && businesses.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={businesses.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all businesses"
              />
            </TableHead>
            <TableHead className="w-[36%]">Business</TableHead>
            <TableHead className="w-[34%]">Email</TableHead>
            <TableHead className="w-[14%] text-right">Emails sent</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
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
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => onToggleId(id, next === true)}
                    aria-label={`Select ${row.title ?? "business"}`}
                  />
                </TableCell>
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
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {row.emails_sent_count ?? 0}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
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
              <dt className="text-muted-foreground">Emails sent</dt>
              <dd className="tabular-nums">{row.emails_sent_count ?? 0}</dd>
            </dl>
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
}) {
  if (!businesses.length) {
    return (
      <EmailCleanerEmptyState hasSearch={hasSearch} hasFilters={hasFilters} />
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
      />
      <div className="hidden min-w-0 md:block">
        <EmailCleanerTableView
          businesses={businesses}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onEditClick={onEditClick}
        />
      </div>
    </>
  );
}
