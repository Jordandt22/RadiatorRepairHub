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
import ClaimRequestStatusBadge from "@/components/pages/claim-requests/ClaimRequestStatusBadge";
import ClaimRequestsEmptyState from "@/components/pages/claim-requests/ClaimRequestsEmptyState";

function shortId(value) {
  if (!value || typeof value !== "string") return "—";
  return value.length > 8 ? `${value.slice(0, 8)}…` : value;
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
    <div className="flex flex-col gap-2">
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
            <TableHead>Business</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            {isSuccessTab ? (
              <>
                <TableHead>Completed By</TableHead>
                <TableHead>Completed At</TableHead>
              </>
            ) : (
              <>
                <TableHead>Last Attempted</TableHead>
                <TableHead>Created</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {claimRequests.map((row) => {
            const id = row.claim_request_id;
            const checked = selectedIds.has(id);
            return (
              <TableRow key={id} data-state={checked ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => onToggleId(id, next === true)}
                    aria-label={`Select claim request for ${row.business?.title ?? "business"}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {row.business?.title ?? "—"}
                </TableCell>
                <TableCell>
                  <ClaimRequestStatusBadge status={row.status} />
                </TableCell>
                <TableCell>{row.attempts ?? 0}</TableCell>
                {isSuccessTab ? (
                  <>
                    <TableCell
                      className="font-mono text-xs text-muted-foreground"
                      title={row.completed_by ?? undefined}
                    >
                      {shortId(row.completed_by)}
                    </TableCell>
                    <TableCell>{formatDate(row.completed_at)}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{formatDate(row.last_attempted_at)}</TableCell>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                  </>
                )}
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
                <p className="truncate font-medium">
                  {row.business?.title ?? "—"}
                </p>
                <div className="mt-1.5">
                  <ClaimRequestStatusBadge status={row.status} />
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
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
      <div className="hidden md:block">
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
