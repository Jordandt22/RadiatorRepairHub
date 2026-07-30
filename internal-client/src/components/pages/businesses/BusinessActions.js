import { RefreshCwIcon, SearchIcon } from "lucide-react";
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
  onRefresh,
  refreshPending = false,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {showTierFilters ? (
          <>
            <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:max-w-xs">
              <BusinessTierCombobox
                items={SCORE_TIERS}
                value={scoreTier}
                onValueChange={onScoreTierChange}
                placeholder="All scores"
                ariaLabel="Filter by score"
                disabled={refreshPending}
              />
            </div>
            <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:max-w-xs">
              <BusinessTierCombobox
                items={REVIEW_TIERS}
                value={reviewsTier}
                onValueChange={onReviewsTierChange}
                placeholder="All reviews"
                ariaLabel="Filter by reviews"
                disabled={refreshPending}
              />
            </div>
            <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:max-w-xs">
              <BusinessTierCombobox
                items={EMAIL_FILTERS}
                value={emailFilter}
                onValueChange={onEmailFilterChange}
                placeholder="All emails"
                ariaLabel="Filter by email"
                disabled={refreshPending}
              />
            </div>
          </>
        ) : null}
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug, email, phone…"
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
            "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:bg-gray-100 max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:ml-auto md:px-6",
          )}
        >
          <RefreshCwIcon
            className={refreshPending ? "animate-spin" : undefined}
          />
          <span className="hidden md:inline">Refresh</span>
        </Button>
      </div>
      {refreshError ? (
        <p className="text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
