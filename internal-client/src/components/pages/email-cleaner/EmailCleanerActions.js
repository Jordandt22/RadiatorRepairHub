import {
  MailXIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";

export const EMAILS_SENT_FILTERS = [
  { id: "true", label: "Outreach sent" },
  { id: "false", label: "Not sent" },
];

export const SUSPICIOUS_FILTERS = [
  { id: "true", label: "Suspicious" },
  { id: "false", label: "Looks fine" },
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

export default function EmailCleanerActions({
  searchValue = "",
  onSearchChange,
  emailsSent = null,
  onEmailsSentChange,
  suspicious = null,
  onSuspiciousChange,
  selectedCount = 0,
  actionDisabled = true,
  selectSuspiciousDisabled = true,
  onDeleteEmails,
  onSelectSuspicious,
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
          label="Select suspicious"
          icon={ShieldAlertIcon}
          disabled={selectSuspiciousDisabled || deletePending}
          onClick={onSelectSuspicious}
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
        <div className="min-w-0 w-full sm:w-auto sm:min-w-36 md:ml-auto md:max-w-44">
          <BusinessTierCombobox
            items={EMAILS_SENT_FILTERS}
            value={emailsSent}
            onValueChange={onEmailsSentChange}
            placeholder="All sent status"
            ariaLabel="Filter by sent status"
            inputName="rrh-cleaner-sent-filter"
            disabled={refreshPending || deletePending}
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto sm:min-w-36 md:max-w-44">
          <BusinessTierCombobox
            items={SUSPICIOUS_FILTERS}
            value={suspicious}
            onValueChange={onSuspiciousChange}
            placeholder="All contacts"
            ariaLabel="Filter by suspicious contacts"
            inputName="rrh-cleaner-suspicious-filter"
            disabled={refreshPending || deletePending}
          />
        </div>
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search title, slug, contact…"
            aria-label="Search businesses with contacts"
            name="rrh-cleaner-search"
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
