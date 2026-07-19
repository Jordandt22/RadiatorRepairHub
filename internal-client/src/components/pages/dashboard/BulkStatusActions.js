import { CheckIcon, FlagIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BulkStatusActions({
  selectedCount,
  disabled,
  actionError,
  onFlag,
  onApprove,
  showFlag = true,
  showApprove = true,
  onRefresh,
  refreshPending = false,
  refreshError = null,
}) {
  const showBulkActions = showFlag || showApprove;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {showFlag ? (
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onFlag}
          >
            <FlagIcon />
            Flag All
          </Button>
        ) : null}
        {showApprove ? (
          <Button size="sm" disabled={disabled} onClick={onApprove}>
            <CheckIcon />
            Approve All
          </Button>
        ) : null}
        {showBulkActions ? (
          selectedCount > 0 ? (
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select messages to update
            </span>
          )
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto cursor-pointer hover:translate-y-[-2px] hover:shadow-md hover:bg-gray-100 transition-all duration-300"
          disabled={refreshPending}
          onClick={onRefresh}
        >
          <RefreshCwIcon className={refreshPending ? "animate-spin" : undefined} />
          Refresh
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
