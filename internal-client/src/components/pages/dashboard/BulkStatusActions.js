import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  BadgeCheckIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  MailCheckIcon,
  MailIcon,
  RefreshCwIcon,
  SendIcon,
  XIcon,
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

export default function BulkStatusActions({
  selectedCount,
  disabled,
  actionError,
  onFlag,
  onApprove,
  onMarkPending,
  showFlag = true,
  showApprove = true,
  showMarkPending = false,
  showMarkSent = false,
  showSendMessages = false,
  showSendConfirmations = false,
  showMarkConfirmed = false,
  showMarkDeclined = false,
  showSendDeclinedMessages = false,
  showArchive = false,
  showUnarchive = false,
  flagDisabled,
  approveDisabled,
  markPendingDisabled,
  markSentDisabled = true,
  sendMessagesDisabled = true,
  sendConfirmationsDisabled = true,
  markConfirmedDisabled = true,
  markDeclinedDisabled = true,
  sendDeclinedMessagesDisabled = true,
  archiveDisabled = true,
  unarchiveDisabled = true,
  onMarkSent,
  onSendMessages,
  onSendConfirmations,
  onMarkConfirmed,
  onMarkDeclined,
  onSendDeclinedMessages,
  onArchive,
  onUnarchive,
  sendPending = false,
  onRefresh,
  refreshPending = false,
  refreshError = null,
}) {
  const flagIsDisabled = flagDisabled ?? disabled;
  const approveIsDisabled = approveDisabled ?? disabled;
  const markPendingIsDisabled = markPendingDisabled ?? disabled;
  const showBulkActions =
    showFlag ||
    showApprove ||
    showMarkPending ||
    showMarkSent ||
    showSendMessages ||
    showSendConfirmations ||
    showMarkConfirmed ||
    showMarkDeclined ||
    showSendDeclinedMessages ||
    showArchive ||
    showUnarchive;

  const buttonClassName = "border-primary/75 hover:shadow-lg hover:bg-primary/75";
  const archiveButtonClassName =
    "border-muted-foreground/80 bg-muted-foreground text-white hover:bg-muted-foreground/80 hover:text-white";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
        {showFlag ? (
          <ActionButton
            label="Flag All"
            icon={FlagIcon}
            disabled={flagIsDisabled}
            onClick={onFlag}
          />
        ) : null}
        {showMarkPending ? (
          <ActionButton
            label="Mark Pending"
            icon={ClockIcon}
            disabled={markPendingIsDisabled}
            onClick={onMarkPending}
          />
        ) : null}
        {showApprove ? (
          <ActionButton
            label="Approve All"
            icon={CheckIcon}
            variant="default"
            disabled={approveIsDisabled}
            onClick={onApprove}
            className={buttonClassName}
          />
        ) : null}
        {showMarkSent ? (
          <ActionButton
            label="Mark Sent"
            icon={MailIcon}
            disabled={markSentDisabled}
            onClick={onMarkSent}
          />
        ) : null}
        {showSendMessages ? (
          <ActionButton
            label="Send Messages"
            icon={SendIcon}
            variant="default"
            disabled={sendMessagesDisabled || sendPending}
            onClick={onSendMessages}
            className={buttonClassName}
          />
        ) : null}
        {showMarkConfirmed ? (
          <ActionButton
            label="Mark Confirmed"
            icon={MailCheckIcon}
            disabled={markConfirmedDisabled}
            onClick={onMarkConfirmed}
          />
        ) : null}
        {showSendConfirmations ? (
          <ActionButton
            label="Send Confirmations"
            icon={BadgeCheckIcon}
            variant="default"
            disabled={sendConfirmationsDisabled}
            onClick={onSendConfirmations}
            className={buttonClassName}
          />
        ) : null}
        {showMarkDeclined ? (
          <ActionButton
            label="Mark Declined"
            icon={XIcon}
            disabled={markDeclinedDisabled}
            onClick={onMarkDeclined}
            className="border-destructive text-destructive hover:bg-destructive/10"
          />
        ) : null}
        {showSendDeclinedMessages ? (
          <ActionButton
            label="Send Declined Messages"
            icon={SendIcon}
            variant="destructive"
            disabled={sendDeclinedMessagesDisabled || sendPending}
            onClick={onSendDeclinedMessages}
            className="border-destructive/10 hover:bg-destructive/10"
          />
        ) : null}
        {showBulkActions && selectedCount > 0 ? (
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
            {selectedCount} selected
          </span>
        ) : null}
        {showArchive ? (
          <ActionButton
            label="Archive"
            icon={ArchiveIcon}
            disabled={archiveDisabled}
            onClick={onArchive}
            className={cn("md:ml-auto", archiveButtonClassName)}
          />
        ) : null}
        {showUnarchive ? (
          <ActionButton
            label="Unarchive"
            icon={ArchiveRestoreIcon}
            variant="default"
            disabled={unarchiveDisabled}
            onClick={onUnarchive}
            className={cn("md:ml-auto", buttonClassName)}
          />
        ) : null}
        <ActionButton
          label="Refresh"
          icon={RefreshCwIcon}
          disabled={refreshPending}
          onClick={onRefresh}
          className={cn(
            "hover:bg-gray-100",
            !showArchive && !showUnarchive ? "md:ml-auto" : null,
          )}
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
