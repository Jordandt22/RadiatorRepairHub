import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessesEmptyState from "@/components/pages/businesses/BusinessesEmptyState";

function BusinessesTableView({ businesses, onViewClick }) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Claimed</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((row) => (
            <TableRow key={row.id} className="group">
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
              <TableCell>{row.phone ?? "—"}</TableCell>
              <TableCell>
                <BusinessClaimedBadge isClaimed={Boolean(row.is_claimed)} />
              </TableCell>
              <TableCell>{formatDate(row.created_at)}</TableCell>
              <TableCell className="text-right">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BusinessesCardList({ businesses, onViewClick }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {businesses.map((row) => (
        <div
          key={row.id}
          className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{row.title ?? "—"}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <BusinessClaimedBadge isClaimed={Boolean(row.is_claimed)} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate">{row.email ?? "—"}</dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{row.phone ?? "—"}</dd>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(row.created_at)}</dd>
          </dl>
          <div>
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
      ))}
    </div>
  );
}

export default function BusinessesTable({
  businesses = [],
  onViewClick,
  activeTab = "all",
  hasSearch = false,
}) {
  if (!businesses.length) {
    return (
      <BusinessesEmptyState activeTab={activeTab} hasSearch={hasSearch} />
    );
  }

  return (
    <>
      <BusinessesCardList businesses={businesses} onViewClick={onViewClick} />
      <BusinessesTableView businesses={businesses} onViewClick={onViewClick} />
    </>
  );
}
