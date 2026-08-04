import { ClipboardListIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import LocationStateCombobox from "@/components/pages/locations/LocationStateCombobox";
import LocationCityCombobox from "@/components/pages/locations/LocationCityCombobox";

const PLACEHOLDERS = {
  states: "Search states…",
  cities: "Search cities…",
  "postal-codes": "Search postal codes…",
  "data-issues": "Search businesses, cities, or postal codes…",
};

export const LOCATION_SORT_OPTIONS = [
  {
    value: "businesses_desc",
    label: "Highest # of Businesses",
  },
  {
    value: "businesses_asc",
    label: "Lowest # of Businesses",
  },
];

export default function LocationActions({
  activeTab = "states",
  searchValue = "",
  onSearchChange,
  sortValue = "businesses_desc",
  onSortChange,
  states = [],
  selectedState = null,
  onStateChange,
  cities = [],
  selectedCity = null,
  onCityChange,
  onExportClick,
  onRefresh,
  refreshPending = false,
  refreshError = null,
}) {
  const showStateFilter =
    activeTab === "cities" || activeTab === "postal-codes";
  const showCityFilter = activeTab === "postal-codes";
  const showSort =
    activeTab === "states" ||
    activeTab === "cities" ||
    activeTab === "postal-codes";
  const showExport =
    activeTab === "states" ||
    activeTab === "cities" ||
    activeTab === "postal-codes";
  const exportDisabled =
    refreshPending ||
    (activeTab === "cities" && !selectedState) ||
    (activeTab === "postal-codes" && !selectedCity);
  const selectedSortLabel =
    LOCATION_SORT_OPTIONS.find((option) => option.value === sortValue)?.label ??
    LOCATION_SORT_OPTIONS[0].label;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {showStateFilter ? (
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[12rem] md:max-w-xs">
            <LocationStateCombobox
              states={states}
              value={selectedState}
              onValueChange={onStateChange}
              disabled={refreshPending}
            />
          </div>
        ) : null}
        {showCityFilter ? (
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[14rem] md:max-w-sm">
            <LocationCityCombobox
              cities={cities}
              value={selectedCity}
              onValueChange={onCityChange}
              disabled={refreshPending}
            />
          </div>
        ) : null}
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={PLACEHOLDERS[activeTab] ?? PLACEHOLDERS.states}
            aria-label="Search locations"
            className="rounded-full pl-9"
          />
        </div>
        {showSort ? (
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[14rem]">
            <Select
              value={sortValue}
              onValueChange={(value) => onSortChange?.(value)}
              disabled={refreshPending}
            >
              <SelectTrigger
                aria-label="Sort locations"
                className="h-9 w-full rounded-full"
              >
                <SelectValue placeholder="Sort by">
                  {selectedSortLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LOCATION_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {showExport ? (
          <Button
            variant="outline"
            size="sm"
            disabled={exportDisabled}
            onClick={onExportClick}
            title={
              activeTab === "cities" && !selectedState
                ? "Select a state first"
                : activeTab === "postal-codes" && !selectedCity
                  ? "Select a city first"
                  : undefined
            }
            aria-label={
              activeTab === "postal-codes"
                ? "Preview postal code stats export"
                : activeTab === "cities"
                  ? "Preview city stats export"
                  : "Preview state stats export"
            }
            className={cn(
              "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:bg-gray-100 max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:ml-auto md:px-6",
            )}
          >
            <ClipboardListIcon />
            <span className="hidden md:inline">Export</span>
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          disabled={refreshPending}
          onClick={onRefresh}
          aria-label="Refresh"
          className={cn(
            "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:bg-gray-100 max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
            !showExport && "md:ml-auto",
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
