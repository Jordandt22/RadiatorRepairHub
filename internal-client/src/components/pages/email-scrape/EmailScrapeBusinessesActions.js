import {
  ListFilterIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const HAS_CONTACT_FILTERS = [
  { id: "true", label: "Has contact" },
  { id: "false", label: "No contact" },
];

/** @deprecated Use HAS_CONTACT_FILTERS */
export const HAS_EMAIL_FILTERS = HAS_CONTACT_FILTERS;

export const ATTEMPTS_FILTERS = [
  { id: "false", label: "No Attempts" },
  { id: "true", label: "Has Attempts" },
];

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

export default function EmailScrapeBusinessesActions({
  searchValue = "",
  onSearchChange,
  filtersActive = false,
  onOpenFilters,
  onRefresh,
  refreshPending = false,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          label="Filters"
          icon={ListFilterIcon}
          disabled={refreshPending}
          onClick={onOpenFilters}
          className={
            filtersActive
              ? "border-foreground/40 bg-muted/60 hover:bg-muted"
              : "hover:bg-gray-100"
          }
        />
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug…"
            aria-label="Search businesses"
            name="rrh-scrape-business-search"
            autoComplete="off"
            className="rounded-full pl-9"
          />
        </div>
        <ActionButton
          label="Refresh"
          icon={RefreshCwIcon}
          disabled={refreshPending}
          onClick={onRefresh}
          className="md:ml-auto hover:bg-gray-100"
          iconClassName={refreshPending ? "animate-spin" : undefined}
        />
      </div>

      {refreshError ? (
        <p className="text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
