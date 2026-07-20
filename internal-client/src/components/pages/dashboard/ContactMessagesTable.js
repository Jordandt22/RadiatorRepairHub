import { EyeIcon, LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IssueBadge,
  StatusBadge,
  UrgencyBadge,
  ConfirmationBadge,
} from "@/components/pages/dashboard/ContactMessageBadges";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ContactMessagesEmptyState from "@/components/pages/dashboard/ContactMessagesEmptyState";

export const EMAIL_SEND_SELECTION_CAP = 5;

export function hasBusinessEmail(message) {
  const email = message?.business?.email;
  return typeof email === "string" && email.trim().length > 0;
}

export function hasContactEmail(message) {
  const email = message?.email;
  return typeof email === "string" && email.trim().length > 0;
}

function formatMessageCount(count) {
  return `${count} ${count === 1 ? "Message" : "Messages"}`;
}

function isMessageSelectable(message, isRowSelectable) {
  if (typeof isRowSelectable === "function") {
    return isRowSelectable(message);
  }
  return true;
}

function MessagesTable({
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
  const selectableMessages = messages.filter((message) =>
    isMessageSelectable(message, isRowSelectable),
  );
  const selectableIds = selectableMessages.map(
    (message) => message.contact_message_id,
  );
  const selectedOnPage = selectableIds.filter((id) => selectedIds.has(id));
  const selectableCount =
    maxSelectable == null
      ? selectableIds.length
      : Math.min(selectableIds.length, maxSelectable);
  const allSelected =
    selectableCount > 0 && selectedOnPage.length >= selectableCount;
  const someSelected =
    selectedOnPage.length > 0 && selectedOnPage.length < selectableCount;
  const hasSelectableRows = selectableIds.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={!hasSelectableRows}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                onClick={(event) => event.stopPropagation()}
                aria-label="Select all in this table"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Status</TableHead>
            {showConfirmation ? <TableHead>Confirmation</TableHead> : null}
            {showConfirmation ? <TableHead>Confirmed At</TableHead> : null}
            <TableHead>{dateLabel}</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => {
            const id = message.contact_message_id;
            const isSelected = selectedIds.has(id);
            const rowLocked = !isMessageSelectable(message, isRowSelectable);
            const selectionBlocked =
              (rowLocked && !isSelected) ||
              (maxSelectable != null &&
                !isSelected &&
                selectedOnPage.length >= maxSelectable);

            return (
              <TableRow
                key={id}
                className={
                  rowLocked ? "group cursor-default" : "group cursor-pointer"
                }
                data-state={isSelected ? "selected" : undefined}
                onClick={() => {
                  if (rowLocked) return;
                  if (selectionBlocked) return;
                  onToggleId(id, !isSelected);
                }}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
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
                </TableCell>
                <TableCell className="font-semibold">{message.name}</TableCell>
                <TableCell>{message.business?.title || "—"}</TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>
                  <IssueBadge issue={message.issue} />
                </TableCell>
                <TableCell>
                  <UrgencyBadge urgency={message.urgency} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={message.status} />
                </TableCell>
                {showConfirmation ? (
                  <TableCell>
                    <ConfirmationBadge
                      confirmationSent={message.confirmation_sent}
                    />
                  </TableCell>
                ) : null}
                {showConfirmation ? (
                  <TableCell>
                    {formatDate(message.confirmation_sent_at)}
                  </TableCell>
                ) : null}
                <TableCell>{formatDate(message[dateField])}</TableCell>
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 transition-all duration-200 group-hover:opacity-100 cursor-pointer hover:scale-95 focus-visible:scale-95"
                    onClick={() => onViewClick(message)}
                  >
                    <EyeIcon />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectionHint ? (
        <p className="text-xs text-muted-foreground">{selectionHint}</p>
      ) : null}
    </div>
  );
}

function SectionEmpty({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ApprovedMessagesTables({
  messages,
  selectedIds,
  onToggleId,
  onViewClick,
}) {
  const withEmail = messages.filter(hasBusinessEmail);
  const withoutEmail = messages.filter((message) => !hasBusinessEmail(message));
  const withEmailIds = withEmail.map((message) => message.contact_message_id);
  const selectedWithEmailCount = withEmailIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const atEmailCap = selectedWithEmailCount >= EMAIL_SEND_SELECTION_CAP;

  const handleToggleEmailId = (id, checked) => {
    if (
      checked &&
      !selectedIds.has(id) &&
      selectedWithEmailCount >= EMAIL_SEND_SELECTION_CAP
    ) {
      return;
    }
    onToggleId(id, checked);
  };

  const handleToggleAllEmail = (checked) => {
    if (!checked) {
      for (const id of withEmailIds) {
        if (selectedIds.has(id)) onToggleId(id, false);
      }
      return;
    }

    let remaining = EMAIL_SEND_SELECTION_CAP - selectedWithEmailCount;
    for (const id of withEmailIds) {
      if (remaining <= 0) break;
      if (selectedIds.has(id)) continue;
      onToggleId(id, true);
      remaining -= 1;
    }
  };

  const handleToggleAllPhone = (checked) => {
    for (const message of withoutEmail) {
      onToggleId(message.contact_message_id, checked);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Emails Available
          </h2>
          <span className="text-xs text-muted-foreground">
            {formatMessageCount(withEmail.length)}
          </span>
        </div>
        {withEmail.length > 0 ? (
          <MessagesTable
            messages={withEmail}
            selectedIds={selectedIds}
            onToggleId={handleToggleEmailId}
            onToggleAll={handleToggleAllEmail}
            onViewClick={onViewClick}
            maxSelectable={EMAIL_SEND_SELECTION_CAP}
            selectionHint={
              atEmailCap
                ? `Select up to ${EMAIL_SEND_SELECTION_CAP} messages to send.`
                : null
            }
          />
        ) : (
          <SectionEmpty
            title="No Businesses with Email Available"
            description="Approved messages linked to businesses that have an email will appear here."
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Phone Numbers Only
          </h2>
          <span className="text-xs text-muted-foreground">
            {formatMessageCount(withoutEmail.length)}
          </span>
        </div>
        {withoutEmail.length > 0 ? (
          <MessagesTable
            messages={withoutEmail}
            selectedIds={selectedIds}
            onToggleId={onToggleId}
            onToggleAll={handleToggleAllPhone}
            onViewClick={onViewClick}
          />
        ) : (
          <SectionEmpty
            title="No Businesses with Phone Numbers Only"
            description="Approved messages linked to businesses missing an email will appear here."
          />
        )}
      </section>
    </div>
  );
}

function SentMessagesTables({ messages, selectedIds, onToggleId, onViewClick }) {
  const autoSent = messages.filter((message) => message.send_method === "auto");
  const manuallySent = messages.filter(
    (message) => message.send_method !== "auto",
  );

  const handleToggleAllIn = (group, checked) => {
    for (const message of group) {
      onToggleId(message.contact_message_id, checked);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Auto Sent</h2>
          <span className="text-xs text-muted-foreground">
            {formatMessageCount(autoSent.length)}
          </span>
        </div>
        {autoSent.length > 0 ? (
          <MessagesTable
            messages={autoSent}
            selectedIds={selectedIds}
            onToggleId={onToggleId}
            onToggleAll={(checked) => handleToggleAllIn(autoSent, checked)}
            onViewClick={onViewClick}
            showConfirmation
            dateField="sent_at"
            dateLabel="Sent At"
          />
        ) : (
          <SectionEmpty
            title="No Auto Sent Messages"
            description="Messages sent through Send Messages will appear here."
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Manually Sent
          </h2>
          <span className="text-xs text-muted-foreground">
            {formatMessageCount(manuallySent.length)}
          </span>
        </div>
        {manuallySent.length > 0 ? (
          <MessagesTable
            messages={manuallySent}
            selectedIds={selectedIds}
            onToggleId={onToggleId}
            onToggleAll={(checked) => handleToggleAllIn(manuallySent, checked)}
            onViewClick={onViewClick}
            showConfirmation
            dateField="sent_at"
            dateLabel="Sent At"
          />
        ) : (
          <SectionEmpty
            title="No Manually Sent Messages"
            description="Messages marked as sent manually will appear here."
          />
        )}
      </section>
    </div>
  );
}

export default function ContactMessagesTable({
  messages,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
  activeTab = "all",
}) {
  if (!messages?.length) {
    return <ContactMessagesEmptyState activeTab={activeTab} />;
  }

  if (activeTab === "approved") {
    return (
      <ApprovedMessagesTables
        messages={messages}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onViewClick={onViewClick}
      />
    );
  }

  if (activeTab === "sent") {
    return (
      <SentMessagesTables
        messages={messages}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onViewClick={onViewClick}
      />
    );
  }

  return (
    <MessagesTable
      messages={messages}
      selectedIds={selectedIds}
      onToggleId={onToggleId}
      onToggleAll={onToggleAll}
      onViewClick={onViewClick}
    />
  );
}
