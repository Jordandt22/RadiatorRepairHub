import Link from "next/link";
import { EyeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { isManagedListingTab } from "@/components/pages/businesses/BusinessFilterTabs";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessFeaturedBadge from "@/components/pages/businesses/BusinessFeaturedBadge";
import BusinessScoreBadge from "@/components/pages/businesses/BusinessScoreBadge";
import BusinessReviewsBadge from "@/components/pages/businesses/BusinessReviewsBadge";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import BusinessesEmptyState from "@/components/pages/businesses/BusinessesEmptyState";
import ClaimInviteTypeBadge from "@/components/pages/businesses/ClaimInviteTypeBadge";

function OwnerEmailCell({ ownerEmail, ownerUid }) {
  if (!ownerEmail) {
    return <span className="text-sm">—</span>;
  }

  const badgeClassName =
    "max-w-full border-transparent bg-sky-100 text-sky-800";

  if (!ownerUid) {
    return (
      <Badge
        variant="outline"
        className={badgeClassName}
        title={ownerEmail}
      >
        <span className="truncate">{ownerEmail}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`${badgeClassName} cursor-pointer hover:bg-sky-200`}
      title={ownerEmail}
      render={<Link href={`/users/${ownerUid}`} />}
    >
      <span className="truncate">{ownerEmail}</span>
    </Badge>
  );
}

function BusinessesTableView({
  businesses,
  showOwnerEmail,
  showClaimInvite,
  showScore,
  showLastEdited,
  showSelection,
  selectedIds,
  onToggleId,
  onToggleAll,
}) {
  const allSelected =
    showSelection &&
    businesses.length > 0 &&
    businesses.every((row) => selectedIds.has(row.id));
  const someSelected =
    showSelection &&
    !allSelected &&
    businesses.some((row) => selectedIds.has(row.id));

  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection ? (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={businesses.length === 0}
                  onCheckedChange={(checked) => onToggleAll(checked === true)}
                  aria-label="Select all businesses"
                />
              </TableHead>
            ) : null}
            <TableHead className="w-[28%]">Business</TableHead>
            {showScore ? <TableHead className="w-[8%]">Score</TableHead> : null}
            {showScore ? (
              <TableHead className="w-[8%] text-right">Reviews</TableHead>
            ) : null}
            <TableHead className="w-[18%]">Email</TableHead>
            {showOwnerEmail ? (
              <TableHead className="w-[16%]">Owner email</TableHead>
            ) : null}
            {showClaimInvite ? (
              <TableHead className="w-[14%]">Claim invite</TableHead>
            ) : null}
            <TableHead className="w-[12%]">Phone</TableHead>
            <TableHead className="w-[14%]">Status</TableHead>
            {showLastEdited ? (
              <TableHead className="w-[12%]">Last edited</TableHead>
            ) : null}
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((row) => {
            const checked = showSelection && selectedIds.has(row.id);
            return (
              <TableRow
                key={row.id}
                className="group"
                data-state={checked ? "selected" : undefined}
              >
                {showSelection ? (
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        onToggleId(row.id, next === true)
                      }
                      aria-label={`Select ${row.title ?? "business"}`}
                    />
                  </TableCell>
                ) : null}
                <TableCell className="max-w-0 font-medium">
                  <BusinessTitleLink
                    id={row.id}
                    title={row.title}
                    slug={row.slug}
                  />
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
                  <span
                    className="block truncate text-sm"
                    title={row.email ?? undefined}
                  >
                    {row.email ?? "—"}
                  </span>
                </TableCell>
                {showOwnerEmail ? (
                  <TableCell className="max-w-0">
                    <OwnerEmailCell
                      ownerEmail={row.owner_email}
                      ownerUid={row.owner_uid}
                    />
                  </TableCell>
                ) : null}
                {showClaimInvite ? (
                  <TableCell className="max-w-0">
                    <ClaimInviteTypeBadge type={row.claim_invite_type} />
                  </TableCell>
                ) : null}
                <TableCell className="max-w-0 whitespace-nowrap">
                  <span className="block truncate">{row.phone ?? "—"}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex flex-col items-start gap-1">
                    <BusinessClaimedBadge isClaimed={Boolean(row.is_claimed)} />
                    {Boolean(row.is_featured) ? (
                      <BusinessFeaturedBadge isFeatured />
                    ) : null}
                  </div>
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
                    nativeButton={false}
                    render={
                      <Link
                        href={`/businesses/${row.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
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

function BusinessesCardList({
  businesses,
  showOwnerEmail,
  showClaimInvite,
  showScore,
  showLastEdited,
  showSelection,
  selectedIds,
  onToggleId,
  onToggleAll,
}) {
  const allSelected =
    showSelection &&
    businesses.length > 0 &&
    businesses.every((row) => selectedIds.has(row.id));
  const someSelected =
    showSelection &&
    !allSelected &&
    businesses.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {showSelection ? (
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
      ) : null}
      {businesses.map((row) => {
        const checked = showSelection && selectedIds.has(row.id);
        return (
          <div
            key={row.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              {showSelection ? (
                <Checkbox
                  checked={checked}
                  onCheckedChange={(next) => onToggleId(row.id, next === true)}
                  aria-label={`Select ${row.title ?? "business"}`}
                  className="mt-0.5"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <BusinessTitleLink
                  id={row.id}
                  title={row.title}
                  slug={row.slug}
                  showSlug={false}
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <BusinessClaimedBadge isClaimed={Boolean(row.is_claimed)} />
                  {Boolean(row.is_featured) ? (
                    <BusinessFeaturedBadge isFeatured />
                  ) : null}
                  {showScore ? (
                    <BusinessScoreBadge score={row.total_score} />
                  ) : null}
                </div>
              </div>
            </div>
            <dl
              className={`grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm ${showSelection ? "pl-8" : ""}`}
            >
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
                  <dd className="min-w-0 truncate">
                    <OwnerEmailCell
                      ownerEmail={row.owner_email}
                      ownerUid={row.owner_uid}
                    />
                  </dd>
                </>
              ) : null}
              {showClaimInvite ? (
                <>
                  <dt className="text-muted-foreground">Claim invite</dt>
                  <dd className="min-w-0 truncate">
                    <ClaimInviteTypeBadge type={row.claim_invite_type} />
                  </dd>
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
            <div className={showSelection ? "pl-8" : undefined}>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                nativeButton={false}
                render={
                  <Link
                    href={`/businesses/${row.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
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

export default function BusinessesTable({
  businesses = [],
  activeTab = "all",
  hasSearch = false,
  selectedIds,
  onToggleId,
  onToggleAll,
}) {
  const isManagedTab = isManagedListingTab(activeTab);
  const showOwnerEmail = isManagedTab;
  const showClaimInvite = isManagedTab;
  const showScore = activeTab === "all";
  const showLastEdited = isManagedTab;
  const showSelection =
    isManagedTab &&
    typeof onToggleId === "function" &&
    typeof onToggleAll === "function" &&
    selectedIds instanceof Set;

  if (!businesses.length) {
    return (
      <BusinessesEmptyState activeTab={activeTab} hasSearch={hasSearch} />
    );
  }

  return (
    <>
      <BusinessesCardList
        businesses={businesses}
        showOwnerEmail={showOwnerEmail}
        showClaimInvite={showClaimInvite}
        showScore={showScore}
        showLastEdited={showLastEdited}
        showSelection={showSelection}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
      />
      <BusinessesTableView
        businesses={businesses}
        showOwnerEmail={showOwnerEmail}
        showClaimInvite={showClaimInvite}
        showScore={showScore}
        showLastEdited={showLastEdited}
        showSelection={showSelection}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
      />
    </>
  );
}
