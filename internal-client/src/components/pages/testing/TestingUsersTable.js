import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import TestingEmptyState from "@/components/pages/testing/TestingEmptyState";

export default function TestingUsersTable({
  users,
  hasSearch = false,
  onDelete,
  deletePending = false,
}) {
  if (!users.length) {
    return <TestingEmptyState tab="users" hasSearch={hasSearch} />;
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((row) => (
          <div
            key={row.uid}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" title={row.email ?? undefined}>
                {row.email ?? "—"}
              </p>
              <p
                className="mt-0.5 truncate font-mono text-xs text-muted-foreground"
                title={row.uid}
              >
                {row.uid}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <UserRoleBadge role={row.role} />
              <span className="text-sm text-muted-foreground">
                {row.claimed_count ?? 0} claimed
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deletePending}
              onClick={() => onDelete(row)}
              className="w-fit cursor-pointer rounded-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2Icon />
              Delete
            </Button>
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Email</TableHead>
              <TableHead className="w-[24%]">UID</TableHead>
              <TableHead className="w-[14%]">Role</TableHead>
              <TableHead className="w-[14%]">Created</TableHead>
              <TableHead className="w-[10%] text-right">Claimed</TableHead>
              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((row) => (
              <TableRow key={row.uid} className="group">
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
                    title={row.uid}
                  >
                    {row.uid}
                  </span>
                </TableCell>
                <TableCell>
                  <UserRoleBadge role={row.role} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatFullDate(row.created_at)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.claimed_count ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deletePending}
                    onClick={() => onDelete(row)}
                    className="cursor-pointer rounded-full border-destructive text-destructive opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
