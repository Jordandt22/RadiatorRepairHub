import { MailXIcon, RefreshCwIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";

export const EMAILS_SENT_FILTERS = [
  { id: "true", label: "Emails Sent" },
  { id: "false", label: "No Emails Sent" },
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
        "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
        className,
      )}
    >
      <Icon className={iconClassName} />
      <span className="hidden md:inline">{label}</span>
    </Button>
  );
}

export default function EmailCleanerActions({
  searchValue = "",
  onSearchChange,
  emailsSent = null,
  onEmailsSentChange,
  selectedCount = 0,
  actionDisabled = true,
  onDeleteEmails,
  onClearSelection,
  onRefresh,
  refreshPending = false,
  deletePending = false,
  actionError = null,
  refreshError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          label="Delete email"
          icon={MailXIcon}
          disabled={actionDisabled || deletePending}
          onClick={onDeleteEmails}
          className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
        />
        <ActionButton
          label="Clear"
          icon={XIcon}
          disabled={selectedCount === 0 || deletePending}
          onClick={onClearSelection}
        />
        {selectedCount > 0 ? (
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
            {selectedCount} selected
          </span>
        ) : null}
        <div className="min-w-0 w-full sm:w-auto sm:min-w-[10rem] md:ml-auto md:max-w-xs">
          <BusinessTierCombobox
            items={EMAILS_SENT_FILTERS}
            value={emailsSent}
            onValueChange={onEmailsSentChange}
            placeholder="All sent status"
            ariaLabel="Filter by sent status"
            disabled={refreshPending || deletePending}
          />
        </div>
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug, email…"
            aria-label="Search businesses with emails"
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
