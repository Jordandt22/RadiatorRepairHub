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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  showArchive = false,
  showUnarchive = false,
  flagDisabled,
  approveDisabled,
  markPendingDisabled,
  markSentDisabled = true,
  sendMessagesDisabled = true,
  sendConfirmationsDisabled = true,
  markConfirmedDisabled = true,
  archiveDisabled = true,
  unarchiveDisabled = true,
  onMarkSent,
  onSendMessages,
  onSendConfirmations,
  onMarkConfirmed,
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
    showArchive ||
    showUnarchive;

  const buttonClassName =
    "cursor-pointer hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 px-6 rounded-full";
  const primaryButtonClassName =
    buttonClassName + " border-primary/75 hover:shadow-lg hover:bg-primary/75";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {showFlag ? (
          <Button
            variant="outline"
            size="sm"
            disabled={flagIsDisabled}
            onClick={onFlag}
            className={buttonClassName}
          >
            <FlagIcon />
            Flag All
          </Button>
        ) : null}
        {showMarkPending ? (
          <Button
            variant="outline"
            size="sm"
            disabled={markPendingIsDisabled}
            onClick={onMarkPending}
            className={buttonClassName}
          >
            <ClockIcon />
            Mark Pending
          </Button>
        ) : null}
        {showApprove ? (
          <Button
            size="sm"
            disabled={approveIsDisabled}
            onClick={onApprove}
            className={primaryButtonClassName}
          >
            <CheckIcon />
            Approve All
          </Button>
        ) : null}
        {showMarkSent ? (
          <Button
            variant="outline"
            size="sm"
            disabled={markSentDisabled}
            onClick={onMarkSent}
            className={buttonClassName}
          >
            <MailIcon />
            Mark Sent
          </Button>
        ) : null}
        {showSendMessages ? (
          <Button
            size="sm"
            disabled={sendMessagesDisabled || sendPending}
            onClick={onSendMessages}
            className={primaryButtonClassName}
          >
            <SendIcon />
            Send Messages
          </Button>
        ) : null}
        {showMarkConfirmed ? (
          <Button
            variant="outline"
            size="sm"
            disabled={markConfirmedDisabled}
            onClick={onMarkConfirmed}
            className={buttonClassName}
          >
            <MailCheckIcon />
            Mark Confirmed
          </Button>
        ) : null}
        {showSendConfirmations ? (
          <Button
            size="sm"
            disabled={sendConfirmationsDisabled}
            onClick={onSendConfirmations}
            className={primaryButtonClassName}
          >
            <BadgeCheckIcon />
            Send Confirmations
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
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {showArchive ? (
            <Button
              variant="outline"
              size="sm"
              disabled={archiveDisabled}
              onClick={onArchive}
              className={cn(
                buttonClassName,
                "border-muted-foreground/80 bg-muted-foreground text-white hover:bg-muted-foreground/80 hover:text-white",
              )}
            >
              <ArchiveIcon />
              Archive
            </Button>
          ) : null}
          {showUnarchive ? (
            <Button
              size="sm"
              disabled={unarchiveDisabled}
              onClick={onUnarchive}
              className={primaryButtonClassName}
            >
              <ArchiveRestoreIcon />
              Unarchive
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className={`hover:bg-gray-100 ${buttonClassName}`}
            disabled={refreshPending}
            onClick={onRefresh}
          >
            <RefreshCwIcon
              className={refreshPending ? "animate-spin" : undefined}
            />
            Refresh
          </Button>
        </div>
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
