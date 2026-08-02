import {
  BanIcon,
  CircleCheckIcon,
  PlusIcon,
  RefreshCwIcon,
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

export default function AffiliateProgramsActions({
  onAdd,
  onActivate,
  onDeactivate,
  onRefresh,
  selectedCount = 0,
  activateDisabled = true,
  deactivateDisabled = true,
  refreshPending = false,
  addDisabled = false,
  actionError = null,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <ActionButton
          label="Activate"
          icon={CircleCheckIcon}
          onClick={onActivate}
          disabled={activateDisabled}
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        />
        <ActionButton
          label="Deactivate"
          icon={BanIcon}
          onClick={onDeactivate}
          disabled={deactivateDisabled}
          className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
        />
        {selectedCount > 0 ? (
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
            {selectedCount} selected
          </span>
        ) : null}
        <ActionButton
          label="Add"
          icon={PlusIcon}
          onClick={onAdd}
          disabled={addDisabled}
        />
        <ActionButton
          label="Refresh"
          icon={RefreshCwIcon}
          onClick={onRefresh}
          disabled={refreshPending}
          iconClassName={refreshPending ? "animate-spin" : undefined}
        />
      </div>
      {actionError ? (
        <p className="text-right text-sm text-destructive">{actionError}</p>
      ) : null}
      {refreshError ? (
        <p className="text-right text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
