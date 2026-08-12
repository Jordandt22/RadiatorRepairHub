import {
  MapPinnedIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadIcon,
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

export default function IngestGroupsActions({
  selectedCount = 0,
  actionDisabled = true,
  onDelete,
  onRefresh,
  onUpload,
  onScrape,
  showUpload = true,
  refreshPending = false,
  deletePending = false,
  uploadPending = false,
  scrapePending = false,
  actionError = null,
  refreshError = null,
  uploadError = null,
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
        {showUpload ? (
          <ActionButton
            label={uploadPending ? "Uploading…" : "Upload JSON"}
            icon={UploadIcon}
            disabled={uploadPending}
            onClick={onUpload}
            className="md:ml-auto hover:bg-gray-100"
          />
        ) : null}
        <ActionButton
          label={scrapePending ? "Starting…" : "Scrape cities"}
          icon={MapPinnedIcon}
          disabled={scrapePending}
          onClick={onScrape}
          className={cn(
            "hover:bg-gray-100",
            showUpload ? undefined : "md:ml-auto",
          )}
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
      {uploadError ? (
        <p className="text-sm text-destructive">{uploadError}</p>
      ) : null}
      {refreshError ? (
        <p className="text-sm text-destructive">{refreshError}</p>
      ) : null}
    </div>
  );
}
