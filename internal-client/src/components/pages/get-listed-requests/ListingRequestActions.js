import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
        className,
      )}
    >
      <Icon className={iconClassName} />
      <span className="hidden md:inline">{label}</span>
    </Button>
  );
}

export default function ListingRequestActions({
  selectedCount = 0,
  showPendingActions = false,
  showReopen = false,
  showDelete = false,
  actionDisabled = true,
  deleteDisabled = true,
  onMarkListed,
  onReject,
  onMarkDuplicate,
  onReopen,
  onDelete,
  onRefresh,
  refreshPending = false,
  deletePending = false,
  actionError = null,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {showPendingActions ? (
          <>
            <ActionButton
              label="Mark Listed"
              icon={CheckIcon}
              disabled={actionDisabled}
              onClick={onMarkListed}
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            />
            <ActionButton
              label="Reject"
              icon={XCircleIcon}
              disabled={actionDisabled}
              onClick={onReject}
              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            />
            <ActionButton
              label="Duplicate"
              icon={CopyIcon}
              disabled={actionDisabled}
              onClick={onMarkDuplicate}
              className="border-zinc-500 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-800"
            />
          </>
        ) : null}
        {showReopen ? (
          <ActionButton
            label="Reopen"
            icon={RotateCcwIcon}
            disabled={actionDisabled}
            onClick={onReopen}
            className="border-amber-600 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
          />
        ) : null}
        {showDelete ? (
          <ActionButton
            label="Delete"
            icon={Trash2Icon}
            disabled={deleteDisabled || deletePending}
            onClick={onDelete}
            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        ) : null}
        {selectedCount > 0 ? (
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
            {selectedCount} selected
          </span>
        ) : null}
        <ActionButton
          label="Refresh"
          icon={RefreshCwIcon}
          disabled={refreshPending}
          onClick={onRefresh}
          className="md:ml-auto hover:bg-gray-100"
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
