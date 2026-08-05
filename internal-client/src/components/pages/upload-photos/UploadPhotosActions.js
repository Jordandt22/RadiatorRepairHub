import { ImageIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
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

export default function UploadPhotosActions({
  selectedCount = 0,
  actionDisabled = true,
  startDisabled = false,
  onDelete,
  onRefresh,
  onStart,
  refreshPending = false,
  deletePending = false,
  startPending = false,
  actionError = null,
  refreshError = null,
  startError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          label="Delete"
          icon={Trash2Icon}
          disabled={actionDisabled || deletePending}
          onClick={onDelete}
          className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
        />
        {selectedCount > 0 ? (
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
            {selectedCount} selected
          </span>
        ) : null}
        <ActionButton
          label={startPending ? "Starting…" : "Start Upload"}
          icon={ImageIcon}
          disabled={startDisabled || startPending}
          onClick={onStart}
          className="md:ml-auto hover:bg-gray-100"
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

      {actionError ? (
        <p className="text-sm text-destructive">{actionError}</p>
      ) : null}
      {startError ? (
        <p className="text-sm text-destructive">{startError}</p>
      ) : null}
      {refreshError ? (
        <p className="text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
