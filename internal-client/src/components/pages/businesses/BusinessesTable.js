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
import BusinessScoreBadge from "@/components/pages/businesses/BusinessScoreBadge";
import BusinessReviewsBadge from "@/components/pages/businesses/BusinessReviewsBadge";
import BusinessesEmptyState from "@/components/pages/businesses/BusinessesEmptyState";

function BusinessesTableView({
  businesses,
  onViewClick,
  showOwnerEmail,
  showScore,
  showLastEdited,
}) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Business</TableHead>
            {showScore ? <TableHead className="w-[8%]">Score</TableHead> : null}
            {showScore ? (
              <TableHead className="w-[8%] text-right">Reviews</TableHead>
            ) : null}
            <TableHead className="w-[18%]">Email</TableHead>
            {showOwnerEmail ? (
              <TableHead className="w-[18%]">Owner email</TableHead>
            ) : null}
            <TableHead className="w-[12%]">Phone</TableHead>
            <TableHead className="w-[10%]">Claimed</TableHead>
            {showLastEdited ? (
              <TableHead className="w-[12%]">Last edited</TableHead>
            ) : null}
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((row) => (
            <TableRow key={row.id} className="group">
              <TableCell className="max-w-0 font-medium">
                <div className="min-w-0">
                  <span className="block truncate">{row.title ?? "—"}</span>
                  {row.slug ? (
                    <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                      /business/{row.slug}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              {showScore ? (
                <TableCell className="whitespace-nowrap">
                  <BusinessScoreBadge score={row.total_score} />
                </TableCell>
              ) : null}
              {showScore ? (
                <TableCell className="whitespace-nowrap text-right">
                  <div className="flex justify-end">
                    <BusinessReviewsBadge count={row.reviews_count} />
                  </div>
                </TableCell>
              ) : null}
              <TableCell className="max-w-0">
                <span className="block truncate text-sm" title={row.email ?? undefined}>
                  {row.email ?? "—"}
                </span>
              </TableCell>
              {showOwnerEmail ? (
                <TableCell className="max-w-0">
                  <span
                    className="block truncate text-sm"
                    title={row.owner_email ?? undefined}
                  >
                    {row.owner_email ?? "—"}
                  </span>
                </TableCell>
              ) : null}
              <TableCell className="max-w-0 whitespace-nowrap">
                <span className="block truncate">{row.phone ?? "—"}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <BusinessClaimedBadge isClaimed={Boolean(row.is_claimed)} />
              </TableCell>
              {showLastEdited ? (
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.last_edited_at)}
                </TableCell>
              ) : null}
              <TableCell className="text-right whitespace-nowrap">
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

function BusinessesCardList({
  businesses,
  onViewClick,
  showOwnerEmail,
  showScore,
  showLastEdited,
}) {
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
              {showScore ? <BusinessScoreBadge score={row.total_score} /> : null}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
            {showScore ? (
              <>
                <dt className="text-muted-foreground">Reviews</dt>
                <dd>
                  <BusinessReviewsBadge count={row.reviews_count} />
                </dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate">{row.email ?? "—"}</dd>
            {showOwnerEmail ? (
              <>
                <dt className="text-muted-foreground">Owner email</dt>
                <dd className="truncate">{row.owner_email ?? "—"}</dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{row.phone ?? "—"}</dd>
            {showLastEdited ? (
              <>
                <dt className="text-muted-foreground">Last edited</dt>
                <dd>{formatDate(row.last_edited_at)}</dd>
              </>
            ) : null}
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
  const showOwnerEmail = activeTab === "claimed";
  const showScore = activeTab === "all";
  const showLastEdited = activeTab === "claimed";

  if (!businesses.length) {
    return (
      <BusinessesEmptyState activeTab={activeTab} hasSearch={hasSearch} />
    );
  }

  return (
    <>
      <BusinessesCardList
        businesses={businesses}
        onViewClick={onViewClick}
        showOwnerEmail={showOwnerEmail}
        showScore={showScore}
        showLastEdited={showLastEdited}
      />
      <BusinessesTableView
        businesses={businesses}
        onViewClick={onViewClick}
        showOwnerEmail={showOwnerEmail}
        showScore={showScore}
        showLastEdited={showLastEdited}
      />
    </>
  );
}
