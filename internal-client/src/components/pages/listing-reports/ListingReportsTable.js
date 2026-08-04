import { EyeIcon } from "lucide-react";
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
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ListingReportStatusBadge from "@/components/pages/listing-reports/ListingReportStatusBadge";
import ListingReportsEmptyState from "@/components/pages/listing-reports/ListingReportsEmptyState";

const REASON_LABELS = {
  wrong_claim_contact: "Wrong claim contact",
  inappropriate: "Inappropriate",
};

function reasonLabel(reason) {
  return REASON_LABELS[reason] ?? reason ?? "—";
}

function ListingReportsTableView({
  listingReports,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    listingReports.length > 0 &&
    listingReports.every((row) => selectedIds.has(row.listing_report_id));
  const someSelected =
    !allSelected &&
    listingReports.some((row) => selectedIds.has(row.listing_report_id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={listingReports.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all listing reports"
              />
            </TableHead>
            <TableHead className="w-[24%]">Business</TableHead>
            <TableHead className="w-[16%]">Reason</TableHead>
            <TableHead className="w-[20%]">Reporter</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[12%]">Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listingReports.map((row) => {
            const id = row.listing_report_id;
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
                    aria-label={`Select report for ${row.business?.title ?? "business"}`}
                  />
                </TableCell>
                <TableCell className="max-w-0 font-medium">
                  <BusinessTitleLink
                    id={row.business?.id}
                    title={row.business?.title}
                    slug={row.business?.slug}
                  />
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate">{reasonLabel(row.reason)}</span>
                </TableCell>
                <TableCell className="max-w-0">
                  <div className="min-w-0">
                    <span
                      className="block truncate text-sm"
                      title={row.reporter_email ?? undefined}
                    >
                      {row.reporter_email ?? "—"}
                    </span>
                    {row.reporter_name ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {row.reporter_name}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <ListingReportStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 transition-all duration-200 group-hover:opacity-100 cursor-pointer hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                    onClick={() => onViewClick(row)}
                  >
                    <EyeIcon />
                    View
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

function ListingReportsCardList({
  listingReports,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    listingReports.length > 0 &&
    listingReports.every((row) => selectedIds.has(row.listing_report_id));
  const someSelected =
    !allSelected &&
    listingReports.some((row) => selectedIds.has(row.listing_report_id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={listingReports.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all listing reports"
        />
        <span className="text-sm text-muted-foreground">
          {listingReports.length}{" "}
          {listingReports.length === 1 ? "report" : "reports"}
        </span>
      </div>
      {listingReports.map((row) => {
        const id = row.listing_report_id;
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
                aria-label={`Select report for ${row.business?.title ?? "business"}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <BusinessTitleLink
                  id={row.business?.id}
                  title={row.business?.title}
                  slug={row.business?.slug}
                  showSlug={false}
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <ListingReportStatusBadge status={row.status} />
                  <span className="text-xs text-muted-foreground">
                    {reasonLabel(row.reason)}
                  </span>
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Reporter</dt>
              <dd className="truncate">{row.reporter_email ?? "—"}</dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(row.created_at)}</dd>
            </dl>
            <div className="pl-8">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => onViewClick(row)}
              >
                <EyeIcon />
                View
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ListingReportsTable({
  listingReports,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
  activeTab,
}) {
  if (!listingReports.length) {
    return <ListingReportsEmptyState activeTab={activeTab} />;
  }

  return (
    <>
      <ListingReportsCardList
        listingReports={listingReports}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
      />
      <div className="hidden min-w-0 md:block">
        <ListingReportsTableView
          listingReports={listingReports}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onViewClick={onViewClick}
        />
      </div>
    </>
  );
}
