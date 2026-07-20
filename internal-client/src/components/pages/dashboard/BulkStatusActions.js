import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  FlagIcon,
  MailCheckIcon,
  MailIcon,
  MessageCircleIcon,
  MessageCircleOffIcon,
  RefreshCwIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function OutcomeMenu({
  label,
  icon: Icon,
  markLabel = "Mark only",
  sendLabel = "Send email",
  markDisabled = true,
  sendDisabled = true,
  onMark,
  onSend,
  variant = "outline",
  triggerClassName,
  destructive = false,
}) {
  const menuDisabled = markDisabled && sendDisabled;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={menuDisabled}
        render={
          <Button
            variant={variant}
            size="sm"
            aria-label={label}
            className={cn(
              "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
              triggerClassName,
            )}
          />
        }
      >
        <Icon />
        <span className="hidden md:inline">{label}</span>
        <ChevronDownIcon className="hidden size-3.5 opacity-70 md:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuItem
          disabled={markDisabled}
          className="cursor-pointer"
          onClick={() => {
            if (markDisabled) return;
            onMark?.();
          }}
        >
          <CheckIcon />
          <span>{markLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={sendDisabled}
          variant={destructive ? "destructive" : "default"}
          className="cursor-pointer"
          onClick={() => {
            if (sendDisabled) return;
            onSend?.();
          }}
        >
          <SendIcon />
          <span>{sendLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  showConfirmedOutcome = false,
  showDeclinedOutcome = false,
  showNoResponseOutcome = false,
  showRespondedOutcome = false,
  showMarkResponded = false,
  showArchive = false,
  showUnarchive = false,
  flagDisabled,
  approveDisabled,
  markPendingDisabled,
  markSentDisabled = true,
  sendMessagesDisabled = true,
  markConfirmedDisabled = true,
  sendConfirmationsDisabled = true,
  markDeclinedDisabled = true,
  sendDeclinedMessagesDisabled = true,
  markNoResponseDisabled = true,
  sendNoResponseDisabled = true,
  markRespondedDisabled = true,
  sendRespondedDisabled = true,
  archiveDisabled = true,
  unarchiveDisabled = true,
  onMarkSent,
  onSendMessages,
  onMarkConfirmed,
  onSendConfirmations,
  onMarkDeclined,
  onSendDeclinedMessages,
  onMarkNoResponse,
  onSendNoResponse,
  onMarkResponded,
  onSendResponded,
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
    showConfirmedOutcome ||
    showDeclinedOutcome ||
    showNoResponseOutcome ||
    showRespondedOutcome ||
    showMarkResponded ||
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
        {showConfirmedOutcome ? (
          <OutcomeMenu
            label="Confirmed"
            icon={MailCheckIcon}
            markDisabled={markConfirmedDisabled}
            sendDisabled={sendConfirmationsDisabled || sendPending}
            onMark={onMarkConfirmed}
            onSend={onSendConfirmations}
            triggerClassName={buttonClassName}
            variant="default"
          />
        ) : null}
        {showDeclinedOutcome ? (
          <OutcomeMenu
            label="Declined"
            icon={XIcon}
            markDisabled={markDeclinedDisabled}
            sendDisabled={sendDeclinedMessagesDisabled || sendPending}
            onMark={onMarkDeclined}
            onSend={onSendDeclinedMessages}
            destructive
            triggerClassName="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        ) : null}
        {showMarkResponded ? (
          <ActionButton
            label="Mark Responded"
            icon={MessageCircleIcon}
            disabled={markRespondedDisabled}
            onClick={onMarkResponded}
          />
        ) : null}
        {showNoResponseOutcome ? (
          <OutcomeMenu
            label="No Response"
            icon={MessageCircleOffIcon}
            markDisabled={markNoResponseDisabled}
            sendDisabled={sendNoResponseDisabled || sendPending}
            onMark={onMarkNoResponse}
            onSend={onSendNoResponse}
          />
        ) : null}
        {showRespondedOutcome ? (
          <OutcomeMenu
            label="Responded"
            icon={MessageCircleIcon}
            markDisabled={markRespondedDisabled}
            sendDisabled={sendRespondedDisabled || sendPending}
            onMark={onMarkResponded}
            onSend={onSendResponded}
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
