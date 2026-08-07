import { RefreshCwIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import {
  HISTORY_EMAIL_FILTERS,
  OUTREACH_TYPE_OPTIONS,
} from "@/components/pages/outreach/outreachConstants";

export default function OutreachHistoryActions({
  searchValue = "",
  onSearchChange,
  outreachType = null,
  onOutreachTypeChange,
  emailFilter = null,
  onEmailFilterChange,
  onRefresh,
  refreshPending = false,
  refreshError = null,
  listError = null,
  selectedCount = 0,
  onRemoveSent,
  removeDisabled = false,
  actionError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-xs">
          <BusinessTierCombobox
            items={OUTREACH_TYPE_OPTIONS}
            value={outreachType}
            onValueChange={onOutreachTypeChange}
            placeholder="All campaign types"
            ariaLabel="Filter history by campaign type"
            inputName="rrh-history-campaign-type"
            disabled={refreshPending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-xs">
          <BusinessTierCombobox
            items={HISTORY_EMAIL_FILTERS}
            value={emailFilter}
            onValueChange={onEmailFilterChange}
            placeholder="All statuses"
            ariaLabel="Filter history by recipient status"
            inputName="rrh-history-recipient-status"
            disabled={refreshPending}
          />
        </div>
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search business, slug, recipient, subject…"
            aria-label="Search outreach history"
            name="rrh-history-search"
            autoComplete="off"
            className="rounded-full pl-9"
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          disabled={removeDisabled}
          onClick={onRemoveSent}
          aria-label="Remove sent status for selected history rows"
          className={cn(
            "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
          )}
        >
          <Trash2Icon />
          <span className="hidden md:inline">
            Remove Sent{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={refreshPending}
          onClick={onRefresh}
          aria-label="Refresh"
          className={cn(
            "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-gray-100 max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:ml-auto md:px-6",
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
      {actionError ? (
        <p className="text-sm text-destructive">{actionError}</p>
      ) : null}
    </div>
  );
}
