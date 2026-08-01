import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import { OUTREACH_TYPE_OPTIONS } from "@/components/pages/outreach/outreachConstants";

export default function OutreachHistoryActions({
  outreachType = null,
  onOutreachTypeChange,
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
            items={OUTREACH_TYPE_OPTIONS}
            value={outreachType}
            onValueChange={onOutreachTypeChange}
            placeholder="All campaign types"
            ariaLabel="Filter history by campaign type"
            disabled={refreshPending}
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
