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
import ContactMessagesCardList from "@/components/pages/dashboard/ContactMessagesCardList";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ContactMessagesEmptyState from "@/components/pages/dashboard/ContactMessagesEmptyState";
import { getMessageSelectionState } from "@/components/pages/dashboard/messageSelection";

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

function MessagesView({
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
  return (
    <>
      <ContactMessagesCardList
        messages={messages}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
        maxSelectable={maxSelectable}
        selectionHint={selectionHint}
        isRowSelectable={isRowSelectable}
        showConfirmation={showConfirmation}
        dateField={dateField}
        dateLabel={dateLabel}
      />
      <div className="hidden md:block">
        <MessagesTable
          messages={messages}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onViewClick={onViewClick}
          maxSelectable={maxSelectable}
          selectionHint={selectionHint}
          isRowSelectable={isRowSelectable}
          showConfirmation={showConfirmation}
          dateField={dateField}
          dateLabel={dateLabel}
        />
      </div>
    </>
  );
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
            const rowLocked = isRowLocked(message);
            const selectionBlocked = isSelectionBlocked(message, isSelected);

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
          <MessagesView
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
          <MessagesView
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
          <MessagesView
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
          <MessagesView
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

function InProgressMessagesTables({
  messages,
  selectedIds,
  onToggleId,
  onViewClick,
}) {
  const responded = messages.filter((message) => message.status === "responded");
  const declined = messages.filter((message) => message.status === "declined");
  const noResponse = messages.filter(
    (message) => message.status === "no_response",
  );

  const handleToggleAllIn = (group, checked) => {
    for (const message of group) {
      onToggleId(message.contact_message_id, checked);
    }
  };

  const sections = [
    {
      key: "responded",
      title: "Responded",
      messages: responded,
      emptyTitle: "No Responded Messages",
      emptyDescription: "Messages where the business has responded will appear here.",
      dateField: "responded_at",
      dateLabel: "Responded At",
    },
    {
      key: "declined",
      title: "Declined",
      messages: declined,
      emptyTitle: "No Declined Messages",
      emptyDescription: "Messages declined by businesses will appear here.",
      dateField: "declined_at",
      dateLabel: "Declined At",
    },
    {
      key: "no_response",
      title: "No Response",
      messages: noResponse,
      emptyTitle: "No Response Messages",
      emptyDescription: "Sent messages with no business response will appear here.",
      dateField: "sent_at",
      dateLabel: "Sent At",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section) => (
        <section key={section.key} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {section.title}
            </h2>
            <span className="text-xs text-muted-foreground">
              {formatMessageCount(section.messages.length)}
            </span>
          </div>
          {section.messages.length > 0 ? (
            <MessagesView
              messages={section.messages}
              selectedIds={selectedIds}
              onToggleId={onToggleId}
              onToggleAll={(checked) =>
                handleToggleAllIn(section.messages, checked)
              }
              onViewClick={onViewClick}
              dateField={section.dateField}
              dateLabel={section.dateLabel}
            />
          ) : (
            <SectionEmpty
              title={section.emptyTitle}
              description={section.emptyDescription}
            />
          )}
        </section>
      ))}
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

  if (activeTab === "in_progress") {
    return (
      <InProgressMessagesTables
        messages={messages}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onViewClick={onViewClick}
      />
    );
  }

  return (
    <MessagesView
      messages={messages}
      selectedIds={selectedIds}
      onToggleId={onToggleId}
      onToggleAll={onToggleAll}
      onViewClick={onViewClick}
    />
  );
}
