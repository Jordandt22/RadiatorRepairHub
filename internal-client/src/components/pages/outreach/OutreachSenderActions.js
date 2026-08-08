import {
  ListChecksIcon,
  PlusIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import {
  OUTREACH_LIMIT_OPTIONS,
  OUTREACH_SENDER_TYPE_OPTIONS,
} from "@/components/pages/outreach/outreachConstants";

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

export default function OutreachSenderActions({
  outreachType = null,
  onOutreachTypeChange,
  matchLimit = null,
  onMatchLimitChange,
  selectedCount = 0,
  workingSetCount = 0,
  onSelectMatching,
  selectMatchingPending = false,
  onAddBusinesses,
  addDisabled = true,
  onClearSelection,
  onPreviewSend,
  previewDisabled = true,
  actionError = null,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 w-full sm:w-auto sm:min-w-40 md:max-w-xs">
          <BusinessTierCombobox
            items={OUTREACH_SENDER_TYPE_OPTIONS}
            value={outreachType}
            onValueChange={onOutreachTypeChange}
            placeholder="Campaign type"
            ariaLabel="Outreach campaign type"
            inputName="rrh-outreach-campaign-type"
            disabled={selectMatchingPending}
          />
        </div>
        <div className="w-full shrink-0 sm:w-28">
          <BusinessTierCombobox
            items={OUTREACH_LIMIT_OPTIONS}
            value={matchLimit}
            onValueChange={onMatchLimitChange}
            placeholder="Limit"
            ariaLabel="Match limit"
            inputName="rrh-outreach-match-limit"
            disabled={selectMatchingPending}
            className="w-full min-w-0"
          />
        </div>
        <ActionButton
          label="Select matching"
          icon={ListChecksIcon}
          disabled={!outreachType || !matchLimit || selectMatchingPending}
          onClick={onSelectMatching}
          iconClassName={selectMatchingPending ? "animate-spin" : undefined}
        />
        <ActionButton
          label="Add"
          icon={PlusIcon}
          disabled={addDisabled}
          onClick={onAddBusinesses}
        />
        <ActionButton
          label="Clear"
          icon={XIcon}
          disabled={workingSetCount === 0}
          onClick={onClearSelection}
        />
        <ActionButton
          label="Send"
          icon={SendIcon}
          disabled={previewDisabled}
          onClick={onPreviewSend}
          className="border-primary text-primary hover:bg-primary/10"
        />
        {selectedCount > 0 ? (
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
            {selectedCount} selected
            {workingSetCount > selectedCount
              ? ` of ${workingSetCount}`
              : ""}
          </span>
        ) : null}
      </div>
      {actionError ? (
        <p className="text-sm text-destructive">{actionError}</p>
      ) : null}
    </div>
  );
}
