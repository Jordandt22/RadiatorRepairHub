import {
  ListFilterIcon,
  RefreshCwIcon,
  SearchIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const HAS_EMAIL_FILTERS = [
  { id: "true", label: "Has contact" },
  { id: "false", label: "No contact" },
];

function ActionButton({
  label,
  icon: Icon,
  variant = "outline",
  disabled,
  onClick,
  className,
  iconClassName,
}) {
  return (
    <Button
      variant={variant}
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

export default function EmailCleanerReviewActions({
  searchValue = "",
  onSearchChange,
  filtersActive = false,
  onOpenFilters,
  selectedCount = 0,
  markStatusDisabled = true,
  onMarkStatus,
  onClearSelection,
  onRefresh,
  refreshPending = false,
  markStatusPending = false,
  actionError = null,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          label="Mark Status"
          icon={TagIcon}
          disabled={markStatusDisabled || markStatusPending}
          onClick={onMarkStatus}
        />
        <ActionButton
          label="Clear"
          icon={XIcon}
          disabled={selectedCount === 0 || markStatusPending}
          onClick={onClearSelection}
        />
        {selectedCount > 0 ? (
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
            {selectedCount} selected
          </span>
        ) : null}
        <ActionButton
          label="Filters"
          icon={ListFilterIcon}
          disabled={refreshPending || markStatusPending}
          onClick={onOpenFilters}
          className={
            filtersActive
              ? "border-foreground/40 bg-muted/60 hover:bg-muted md:ml-auto"
              : "hover:bg-gray-100 md:ml-auto"
          }
        />
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug, contact…"
            aria-label="Search businesses"
            name="rrh-cleaner-review-search"
            autoComplete="off"
            className="rounded-full pl-9"
          />
        </div>
        <ActionButton
          label="Refresh"
          icon={RefreshCwIcon}
          disabled={refreshPending}
          onClick={onRefresh}
          className="hover:bg-gray-100"
          iconClassName={refreshPending ? "animate-spin" : undefined}
        />
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
