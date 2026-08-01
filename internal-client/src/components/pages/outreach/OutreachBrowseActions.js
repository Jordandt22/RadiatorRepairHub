import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import {
  CLAIM_ELIGIBILITY_FILTERS,
  SENT_FILTERS,
  WEBSITE_FILTERS,
} from "@/components/pages/outreach/outreachConstants";

export default function OutreachBrowseActions({
  searchValue = "",
  onSearchChange,
  claimEligibility = null,
  onClaimEligibilityChange,
  websiteFilter = null,
  onWebsiteFilterChange,
  claimInviteSent = null,
  onClaimInviteSentChange,
  websiteOfferSent = null,
  onWebsiteOfferSentChange,
  onRefresh,
  refreshPending = false,
  refreshError = null,
  listError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:max-w-xs">
          <BusinessTierCombobox
            items={CLAIM_ELIGIBILITY_FILTERS}
            value={claimEligibility}
            onValueChange={onClaimEligibilityChange}
            placeholder="All eligibility"
            ariaLabel="Filter by claim eligibility"
            disabled={refreshPending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:max-w-xs">
          <BusinessTierCombobox
            items={WEBSITE_FILTERS}
            value={websiteFilter}
            onValueChange={onWebsiteFilterChange}
            placeholder="All websites"
            ariaLabel="Filter by website"
            disabled={refreshPending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:max-w-xs">
          <BusinessTierCombobox
            items={SENT_FILTERS}
            value={claimInviteSent}
            onValueChange={onClaimInviteSentChange}
            placeholder="Claim invite"
            ariaLabel="Filter by claim invite sent"
            disabled={refreshPending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:max-w-xs">
          <BusinessTierCombobox
            items={SENT_FILTERS}
            value={websiteOfferSent}
            onValueChange={onWebsiteOfferSentChange}
            placeholder="Website offer"
            ariaLabel="Filter by website offer sent"
            disabled={refreshPending}
          />
        </div>
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug, email, phone…"
            aria-label="Search outreach businesses"
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
      {listError ? (
        <p className="text-sm text-destructive">{listError}</p>
      ) : null}
      {refreshError ? (
        <p className="text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
