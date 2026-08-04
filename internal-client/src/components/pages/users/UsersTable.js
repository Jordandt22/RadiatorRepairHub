import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";
import UserRoleBadge from "@/components/pages/users/UserRoleBadge";
import UsersEmptyState from "@/components/pages/users/UsersEmptyState";

function UsersTableView({ users, selectedIds, onToggleId, onToggleAll }) {
  const allSelected =
    users.length > 0 && users.every((row) => selectedIds.has(row.uid));
  const someSelected =
    !allSelected && users.some((row) => selectedIds.has(row.uid));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={users.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all users"
              />
            </TableHead>
            <TableHead className="w-[28%]">Email</TableHead>
            <TableHead className="w-[28%]">UID</TableHead>
            <TableHead className="w-[16%]">Role</TableHead>
            <TableHead className="w-[16%]">Created</TableHead>
            <TableHead className="w-[12%] text-right">Claimed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((row) => {
            const id = row.uid;
            const checked = selectedIds.has(id);
            return (
              <TableRow
                key={id}
                data-state={checked ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => onToggleId(id, next === true)}
                    aria-label={`Select ${row.email ?? "user"}`}
                  />
                </TableCell>
                <TableCell className="max-w-0">
                  <span
                    className="block truncate text-sm font-medium"
                    title={row.email ?? undefined}
                  >
                    {row.email ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="max-w-0">
                  <span
                    className="block truncate font-mono text-xs text-muted-foreground"
                    title={row.uid ?? undefined}
                  >
                    {row.uid ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <UserRoleBadge role={row.role} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatFullDate(row.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {row.claimed_count ?? 0}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function UsersCardList({ users, selectedIds, onToggleId, onToggleAll }) {
  const allSelected =
    users.length > 0 && users.every((row) => selectedIds.has(row.uid));
  const someSelected =
    !allSelected && users.some((row) => selectedIds.has(row.uid));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={users.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all users"
        />
        <span className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? "user" : "users"}
        </span>
      </div>
      {users.map((row) => {
        const id = row.uid;
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
                aria-label={`Select ${row.email ?? "user"}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.email ?? "—"}</p>
                <p
                  className="mt-0.5 truncate font-mono text-xs text-muted-foreground"
                  title={row.uid ?? undefined}
                >
                  {row.uid ?? "—"}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <UserRoleBadge role={row.role} />
              </dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatFullDate(row.created_at)}</dd>
              <dt className="text-muted-foreground">Claimed</dt>
              <dd className="tabular-nums">{row.claimed_count ?? 0}</dd>
            </dl>
          </div>
        );
      })}
    </div>
  );
}

export default function UsersTable({
  users = [],
  selectedIds,
  onToggleId,
  onToggleAll,
}) {
  if (!users.length) {
    return <UsersEmptyState />;
  }

  return (
    <>
      <UsersCardList
        users={users}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
      />
      <div className="hidden min-w-0 md:block">
        <UsersTableView
          users={users}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
        />
      </div>
    </>
  );
}
