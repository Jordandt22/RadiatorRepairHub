import { ClipboardListIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CLAIM_FILTERS,
  PHONE_LINE_TYPE_FILTERS,
  PHONE_REACH_FILTERS,
  WEBSITE_FILTERS,
} from "@/lib/businessTiers";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";

function ActionButton({
  label,
  icon: Icon,
  disabled,
  onClick,
  className,
  iconClassName,
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
        className,
      )}
    >
      <Icon className={iconClassName} />
      <span className="hidden md:inline">{label}</span>
    </Button>
  );
}

export default function WebsitesBusinessesActions({
  searchValue = "",
  onSearchChange,
  websiteFilter = null,
  onWebsiteFilterChange,
  claimFilter = null,
  onClaimFilterChange,
  phoneReach = null,
  onPhoneReachChange,
  phoneLineType = null,
  onPhoneLineTypeChange,
  onExportClick,
  onRefresh,
  refreshPending = false,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-xs">
          <BusinessTierCombobox
            items={WEBSITE_FILTERS}
            value={websiteFilter}
            onValueChange={onWebsiteFilterChange}
            placeholder="All websites"
            ariaLabel="Filter by website"
            inputName="rrh-website-filter"
            disabled={refreshPending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-36 md:max-w-44">
          <BusinessTierCombobox
            items={CLAIM_FILTERS}
            value={claimFilter}
            onValueChange={onClaimFilterChange}
            placeholder="Claimed or not"
            ariaLabel="Filter by claimed or unclaimed"
            inputName="rrh-claim-filter"
            disabled={refreshPending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-36 md:max-w-44">
          <BusinessTierCombobox
            items={PHONE_REACH_FILTERS}
            value={phoneReach}
            onValueChange={onPhoneReachChange}
            placeholder="All phones"
            ariaLabel="Filter by call only or both"
            inputName="rrh-phone-reach-filter"
            disabled={refreshPending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-52">
          <BusinessTierCombobox
            items={PHONE_LINE_TYPE_FILTERS}
            value={phoneLineType}
            onValueChange={onPhoneLineTypeChange}
            placeholder="All line types"
            ariaLabel="Filter by line type"
            inputName="rrh-phone-line-type-filter"
            disabled={refreshPending}
          />
        </div>
        <div className="relative min-w-0 flex-1 md:ml-auto md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug, website…"
            aria-label="Search businesses"
            name="rrh-websites-search"
            autoComplete="off"
            className="rounded-full pl-9"
          />
        </div>
        <ActionButton
          label="Export"
          icon={ClipboardListIcon}
          disabled={false}
          onClick={onExportClick}
          className="hover:bg-gray-100"
        />
        <ActionButton
          label="Refresh"
          icon={RefreshCwIcon}
          disabled={refreshPending}
          onClick={onRefresh}
          className="hover:bg-gray-100"
          iconClassName={refreshPending ? "animate-spin" : undefined}
        />
      </div>

      {refreshError ? (
        <p className="text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
