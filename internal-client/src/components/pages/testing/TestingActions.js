import { PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function TestingActions({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  createLabel = "Create",
  onCreate,
  createDisabled = false,
  onRefresh,
  refreshPending = false,
  actionError = null,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={createDisabled}
          onClick={onCreate}
          className="shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6"
        >
          <PlusIcon />
          <span className="hidden md:inline">{createLabel}</span>
        </Button>
        <div className="relative min-w-0 flex-1 md:max-w-sm md:ml-auto">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            autoComplete="off"
            className="rounded-full pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={refreshPending}
          onClick={onRefresh}
          aria-label="Refresh"
          className="shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6"
        >
          <RefreshCwIcon className={cn(refreshPending && "animate-spin")} />
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
