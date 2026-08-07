import { RefreshCwIcon, SearchIcon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SCORE_TIERS,
  REVIEW_TIERS,
  EMAIL_FILTERS,
} from "@/lib/businessTiers";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";

export default function BusinessActions({
  searchValue = "",
  onSearchChange,
  showTierFilters = false,
  scoreTier = null,
  onScoreTierChange,
  reviewsTier = null,
  onReviewsTierChange,
  emailFilter = null,
  onEmailFilterChange,
  showReverseClaim = false,
  selectedCount = 0,
  reverseClaimDisabled = true,
  onReverseClaim,
  reverseClaimPending = false,
  actionError = null,
  onRefresh,
  refreshPending = false,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {showReverseClaim ? (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={reverseClaimDisabled || reverseClaimPending}
              onClick={onReverseClaim}
              aria-label="Reverse claim"
              className={cn(
                "shrink-0 cursor-pointer rounded-full border-destructive text-destructive transition-all duration-300 hover:-translate-y-0.5 hover:bg-destructive/10 hover:text-destructive hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
              )}
            >
              <Undo2Icon />
              <span className="hidden md:inline">Reverse claim</span>
            </Button>
            {selectedCount > 0 ? (
              <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
                {selectedCount} selected
              </span>
            ) : null}
          </>
        ) : null}
        {showTierFilters ? (
          <>
            <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-xs">
              <BusinessTierCombobox
                items={SCORE_TIERS}
                value={scoreTier}
                onValueChange={onScoreTierChange}
                placeholder="All scores"
                ariaLabel="Filter by score"
                inputName="rrh-business-score-filter"
                disabled={refreshPending}
              />
            </div>
            <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-xs">
              <BusinessTierCombobox
                items={REVIEW_TIERS}
                value={reviewsTier}
                onValueChange={onReviewsTierChange}
                placeholder="All reviews"
                ariaLabel="Filter by reviews"
                inputName="rrh-business-reviews-filter"
                disabled={refreshPending}
              />
            </div>
            <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-xs">
              <BusinessTierCombobox
                items={EMAIL_FILTERS}
                value={emailFilter}
                onValueChange={onEmailFilterChange}
                placeholder="All contacts"
                ariaLabel="Filter by contact"
                inputName="rrh-listing-contact-filter"
                disabled={refreshPending}
              />
            </div>
          </>
        ) : null}
        <div
          className={cn(
            "relative min-w-0 flex-1 md:max-w-sm",
            showReverseClaim ? "md:ml-auto" : null,
          )}
        >
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug, contact, phone…"
            name="rrh-businesses-search"
            autoComplete="off"
            aria-label="Search businesses"
            className="rounded-full pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={refreshPending}
          onClick={onRefresh}
          aria-label="Refresh"
          className={cn(
            "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-gray-100 max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
            !showReverseClaim && "md:ml-auto",
          )}
        >
          <RefreshCwIcon
            className={refreshPending ? "animate-spin" : undefined}
          />
          <span className="hidden md:inline">Refresh</span>
        </Button>
      </div>
      {actionError ? (
        <p className="text-sm text-destructive">{actionError}</p>
      ) : null}
      {refreshError ? (
        <p className="text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
