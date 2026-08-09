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
import { formatDate } from "@/components/pages/dashboard/formatDate";
import InquiryStatusBadge from "@/components/pages/inquiries/InquiryStatusBadge";
import InquiriesEmptyState from "@/components/pages/inquiries/InquiriesEmptyState";

function InquiriesTableView({
  contactInquiries,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    contactInquiries.length > 0 &&
    contactInquiries.every((row) => selectedIds.has(row.contact_inquiry_id));
  const someSelected =
    !allSelected &&
    contactInquiries.some((row) => selectedIds.has(row.contact_inquiry_id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={contactInquiries.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all inquiries"
              />
            </TableHead>
            <TableHead className="w-[18%]">Name</TableHead>
            <TableHead className="w-[22%]">Subject</TableHead>
            <TableHead className="w-[22%]">Email</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[12%]">Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contactInquiries.map((row) => {
            const id = row.contact_inquiry_id;
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
                    aria-label={`Select inquiry from ${row.name ?? "sender"}`}
                  />
                </TableCell>
                <TableCell className="max-w-0 font-medium">
                  <span className="block truncate">{row.name ?? "—"}</span>
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate">{row.subject ?? "—"}</span>
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
                  <InquiryStatusBadge status={row.status} />
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

function InquiriesCardList({
  contactInquiries,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    contactInquiries.length > 0 &&
    contactInquiries.every((row) => selectedIds.has(row.contact_inquiry_id));
  const someSelected =
    !allSelected &&
    contactInquiries.some((row) => selectedIds.has(row.contact_inquiry_id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={contactInquiries.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all inquiries"
        />
        <span className="text-sm text-muted-foreground">
          {contactInquiries.length}{" "}
          {contactInquiries.length === 1 ? "inquiry" : "inquiries"}
        </span>
      </div>
      {contactInquiries.map((row) => {
        const id = row.contact_inquiry_id;
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
                aria-label={`Select inquiry from ${row.name ?? "sender"}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.name ?? "—"}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <InquiryStatusBadge status={row.status} />
                  <span className="text-xs text-muted-foreground">
                    {row.subject ?? "—"}
                  </span>
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{row.email ?? "—"}</dd>
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

export default function InquiriesTable({
  contactInquiries,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
  activeTab,
}) {
  if (!contactInquiries.length) {
    return <InquiriesEmptyState activeTab={activeTab} />;
  }

  return (
    <>
      <InquiriesCardList
        contactInquiries={contactInquiries}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
      />
      <div className="hidden min-w-0 md:block">
        <InquiriesTableView
          contactInquiries={contactInquiries}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onViewClick={onViewClick}
        />
      </div>
    </>
  );
}
