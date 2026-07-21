import { ChevronRightIcon, LockIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ConfirmationBadge,
  IssueBadge,
  StatusBadge,
  UrgencyBadge,
} from "@/components/pages/dashboard/ContactMessageBadges";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import { getMessageSelectionState } from "@/components/pages/dashboard/messageSelection";
import { cn } from "@/lib/utils";

function ContactMessageCard({
  message,
  isSelected,
  rowLocked,
  selectionBlocked,
  onToggleId,
  onViewClick,
  showConfirmation,
  dateField,
  dateLabel,
}) {
  const id = message.contact_message_id;

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-2.5 transition-colors md:p-3",
        isSelected ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="pt-0.5"
          onClick={(event) => event.stopPropagation()}
        >
          {rowLocked ? (
            <LockIcon
              className="size-4 text-muted-foreground/60"
              aria-label={`${message.name} is locked`}
            />
          ) : (
            <Checkbox
              checked={isSelected}
              disabled={selectionBlocked}
              onCheckedChange={(checked) => {
                if (checked === true && selectionBlocked) return;
                onToggleId(id, checked === true);
              }}
              aria-label={`Select ${message.name}`}
            />
          )}
        </div>

        <button
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left"
          onClick={() => onViewClick(message)}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="truncate font-semibold text-foreground">
                {message.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {message.business?.title || "—"}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <StatusBadge status={message.status} />
              <UrgencyBadge urgency={message.urgency} />
              <IssueBadge issue={message.issue} />
              {showConfirmation ? (
                <ConfirmationBadge
                  confirmationSent={message.confirmation_sent}
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {dateLabel}: {formatDate(message[dateField])}
              </span>
              {showConfirmation && message.confirmation_sent_at ? (
                <span>
                  Confirmed: {formatDate(message.confirmation_sent_at)}
                </span>
              ) : null}
            </div>
          </div>

          <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </button>
      </div>
    </article>
  );
}

export default function ContactMessagesCardList({
  messages,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
  maxSelectable = null,
  selectionHint = null,
  isRowSelectable = null,
  showConfirmation = false,
  dateField = "created_at",
  dateLabel = "Created",
}) {
  const {
    allSelected,
    someSelected,
    hasSelectableRows,
    isRowLocked,
    isSelectionBlocked,
  } = getMessageSelectionState(messages, selectedIds, {
    maxSelectable,
    isRowSelectable,
  });

  return (
    <div className="flex flex-col gap-2 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={!hasSelectableRows}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all"
        />
        <span className="text-xs text-muted-foreground">Select all</span>
      </div>

      <div className="flex flex-col gap-2">
        {messages.map((message) => {
          const id = message.contact_message_id;
          const isSelected = selectedIds.has(id);
          const rowLocked = isRowLocked(message);
          const selectionBlocked = isSelectionBlocked(message, isSelected);

          return (
            <ContactMessageCard
              key={id}
              message={message}
              isSelected={isSelected}
              rowLocked={rowLocked}
              selectionBlocked={selectionBlocked}
              onToggleId={onToggleId}
              onViewClick={onViewClick}
              showConfirmation={showConfirmation}
              dateField={dateField}
              dateLabel={dateLabel}
            />
          );
        })}
      </div>

      {selectionHint ? (
        <p className="text-xs text-muted-foreground">{selectionHint}</p>
      ) : null}
    </div>
  );
}
