import Link from "next/link";
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
import ClaimRequestStatusBadge from "@/components/pages/claim-requests/ClaimRequestStatusBadge";
import ClaimRequestsEmptyState from "@/components/pages/claim-requests/ClaimRequestsEmptyState";

function shortId(value) {
  if (!value || typeof value !== "string") return "—";
  return value.length > 8 ? `${value.slice(0, 8)}…` : value;
}

function channelLabel(channel) {
  if (channel === "phone") return "Phone call";
  if (channel === "email") return "Email";
  return "—";
}

function contactUsed(row) {
  if (row.contact) return row.contact;
  if (row.channel === "email") return row.business?.email || "—";
  if (row.channel === "phone") return row.business?.phone || "—";
  return "—";
}

function ClaimRequestsTableView({
  claimRequests,
  selectedIds,
  onToggleId,
  onToggleAll,
  activeTab,
}) {
  const isSuccessTab = activeTab === "success";
  const allSelected =
    claimRequests.length > 0 &&
    claimRequests.every((row) => selectedIds.has(row.claim_request_id));
  const someSelected =
    !allSelected &&
    claimRequests.some((row) => selectedIds.has(row.claim_request_id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={claimRequests.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all claim requests"
              />
            </TableHead>
            <TableHead className="w-[20%]">Business</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="w-[10%]">Channel</TableHead>
            <TableHead className="w-[16%]">Contact</TableHead>
            <TableHead className="w-[8%]">Attempts</TableHead>
            {isSuccessTab ? (
              <>
                <TableHead className="w-[12%]">Completed By</TableHead>
                <TableHead className="w-[12%]">Completed At</TableHead>
              </>
            ) : (
              <>
                <TableHead className="w-[12%]">Last Attempted</TableHead>
                <TableHead className="w-[12%]">Created</TableHead>
              </>
            )}
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claimRequests.map((row) => {
            const id = row.claim_request_id;
            const checked = selectedIds.has(id);
            const contact = contactUsed(row);
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
                    aria-label={`Select claim request for ${row.business?.title ?? "business"}`}
                  />
                </TableCell>
                <TableCell className="max-w-0 font-medium">
                  <BusinessTitleLink
                    id={row.business?.id}
                    title={row.business?.title}
                    showSlug={false}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <ClaimRequestStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {channelLabel(row.channel)}
                </TableCell>
                <TableCell className="max-w-0">
                  <span
                    className="block truncate text-sm"
                    title={contact !== "—" ? contact : undefined}
                  >
                    {contact}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.attempts ?? 0}
                </TableCell>
                {isSuccessTab ? (
                  <>
                    <TableCell
                      className="max-w-0 font-mono text-xs text-muted-foreground"
                      title={row.completed_by ?? undefined}
                    >
                      <span className="block truncate">
                        {shortId(row.completed_by)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.completed_at)}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.last_attempted_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                    nativeButton={false}
                    render={
                      <Link href={`/claim-requests/${row.claim_request_id}`} />
                    }
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

function ClaimRequestsCardList({
  claimRequests,
  selectedIds,
  onToggleId,
  onToggleAll,
  activeTab,
}) {
  const isSuccessTab = activeTab === "success";
  const allSelected =
    claimRequests.length > 0 &&
    claimRequests.every((row) => selectedIds.has(row.claim_request_id));
  const someSelected =
    !allSelected &&
    claimRequests.some((row) => selectedIds.has(row.claim_request_id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={claimRequests.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all claim requests"
        />
        <span className="text-sm text-muted-foreground">
          {claimRequests.length}{" "}
          {claimRequests.length === 1 ? "request" : "requests"}
        </span>
      </div>
      {claimRequests.map((row) => {
        const id = row.claim_request_id;
        const checked = selectedIds.has(id);
        const contact = contactUsed(row);
        return (
          <div
            key={id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggleId(id, next === true)}
                aria-label={`Select claim request for ${row.business?.title ?? "business"}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <BusinessTitleLink
                  id={row.business?.id}
                  title={row.business?.title}
                  showSlug={false}
                />
                <div className="mt-1.5">
                  <ClaimRequestStatusBadge status={row.status} />
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Channel</dt>
              <dd>{channelLabel(row.channel)}</dd>
              <dt className="text-muted-foreground">Contact</dt>
              <dd className="truncate" title={contact !== "—" ? contact : undefined}>
                {contact}
              </dd>
              <dt className="text-muted-foreground">Attempts</dt>
              <dd>{row.attempts ?? 0}</dd>
              {isSuccessTab ? (
                <>
                  <dt className="text-muted-foreground">Completed By</dt>
                  <dd
                    className="truncate font-mono text-xs"
                    title={row.completed_by ?? undefined}
                  >
                    {shortId(row.completed_by)}
                  </dd>
                  <dt className="text-muted-foreground">Completed At</dt>
                  <dd>{formatDate(row.completed_at)}</dd>
                </>
              ) : (
                <>
                  <dt className="text-muted-foreground">Last Attempted</dt>
                  <dd>{formatDate(row.last_attempted_at)}</dd>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(row.created_at)}</dd>
                </>
              )}
            </dl>
            <div className="pl-8">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                nativeButton={false}
                render={
                  <Link href={`/claim-requests/${row.claim_request_id}`} />
                }
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

export default function ClaimRequestsTable({
  claimRequests,
  selectedIds,
  onToggleId,
  onToggleAll,
  activeTab,
}) {
  if (!claimRequests.length) {
    return <ClaimRequestsEmptyState activeTab={activeTab} />;
  }

  return (
    <>
      <ClaimRequestsCardList
        claimRequests={claimRequests}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        activeTab={activeTab}
      />
      <div className="hidden min-w-0 md:block">
        <ClaimRequestsTableView
          claimRequests={claimRequests}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          activeTab={activeTab}
        />
      </div>
    </>
  );
}
