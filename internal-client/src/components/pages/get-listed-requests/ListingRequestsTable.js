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
import ListingRequestStatusBadge from "@/components/pages/get-listed-requests/ListingRequestStatusBadge";
import ListingRequestsEmptyState from "@/components/pages/get-listed-requests/ListingRequestsEmptyState";

function ListingRequestsTableView({
  listingRequests,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    listingRequests.length > 0 &&
    listingRequests.every((row) => selectedIds.has(row.listing_request_id));
  const someSelected =
    !allSelected &&
    listingRequests.some((row) => selectedIds.has(row.listing_request_id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={listingRequests.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all listing requests"
              />
            </TableHead>
            <TableHead className="w-[20%]">Business</TableHead>
            <TableHead className="w-[20%]">Email</TableHead>
            <TableHead className="w-[24%]">Google Link</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[12%]">Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listingRequests.map((row) => {
            const id = row.listing_request_id;
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
                    aria-label={`Select request for ${row.business_name ?? "business"}`}
                  />
                </TableCell>
                <TableCell className="max-w-0 font-medium">
                  <span className="block truncate">
                    {row.business_name ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="max-w-0">
                  <span
                    className="block truncate text-sm"
                    title={row.email ?? undefined}
                  >
                    {row.email ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="max-w-0">
                  {row.google_maps_url ? (
                    <a
                      href={row.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-blue-600 underline underline-offset-2 hover:text-blue-800"
                      title={row.google_maps_url}
                    >
                      {row.google_maps_url}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <ListingRequestStatusBadge status={row.status} />
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

function ListingRequestsCardList({
  listingRequests,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    listingRequests.length > 0 &&
    listingRequests.every((row) => selectedIds.has(row.listing_request_id));
  const someSelected =
    !allSelected &&
    listingRequests.some((row) => selectedIds.has(row.listing_request_id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={listingRequests.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all listing requests"
        />
        <span className="text-sm text-muted-foreground">
          {listingRequests.length}{" "}
          {listingRequests.length === 1 ? "request" : "requests"}
        </span>
      </div>
      {listingRequests.map((row) => {
        const id = row.listing_request_id;
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
                aria-label={`Select request for ${row.business_name ?? "business"}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {row.business_name ?? "—"}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <ListingRequestStatusBadge status={row.status} />
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{row.email ?? "—"}</dd>
              <dt className="text-muted-foreground">Google</dt>
              <dd className="truncate">
                {row.google_maps_url ? (
                  <a
                    href={row.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline underline-offset-2"
                  >
                    Open link
                  </a>
                ) : (
                  "—"
                )}
              </dd>
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

export default function ListingRequestsTable({
  listingRequests,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
  activeTab,
}) {
  if (!listingRequests.length) {
    return <ListingRequestsEmptyState activeTab={activeTab} />;
  }

  return (
    <>
      <ListingRequestsCardList
        listingRequests={listingRequests}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
      />
      <div className="hidden min-w-0 md:block">
        <ListingRequestsTableView
          listingRequests={listingRequests}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onViewClick={onViewClick}
        />
      </div>
    </>
  );
}
