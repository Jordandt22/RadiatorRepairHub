import { EyeIcon } from "lucide-react";
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
} from "@/components/pages/dashboard/ContactMessageBadges";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import ContactMessagesEmptyState from "@/components/pages/dashboard/ContactMessagesEmptyState";

function hasBusinessEmail(message) {
  const email = message?.business?.email;
  return typeof email === "string" && email.trim().length > 0;
}

function MessagesTable({
  messages,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const pageIds = messages.map((message) => message.contact_message_id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));
  const allSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someSelected =
    selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
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
          <TableHead>Created</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => {
          const id = message.contact_message_id;
          const isSelected = selectedIds.has(id);

          return (
            <TableRow
              key={id}
              className="group cursor-pointer"
              data-state={isSelected ? "selected" : undefined}
              onClick={() => onToggleId(id, !isSelected)}
            >
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onToggleId(id, checked === true)
                  }
                  aria-label={`Select ${message.name}`}
                />
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
              <TableCell>{formatDate(message.created_at)}</TableCell>
              <TableCell
                className="text-right"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
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
  onToggleAll,
  onViewClick,
}) {
  const withEmail = messages.filter(hasBusinessEmail);
  const withoutEmail = messages.filter((message) => !hasBusinessEmail(message));

  const handleToggleAllIn = (group, checked) => {
    for (const message of group) {
      onToggleId(message.contact_message_id, checked);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Email Available
          </h2>
          <span className="text-xs text-muted-foreground">
            {withEmail.length}
          </span>
        </div>
        {withEmail.length > 0 ? (
          <MessagesTable
            messages={withEmail}
            selectedIds={selectedIds}
            onToggleId={onToggleId}
            onToggleAll={(checked) => handleToggleAllIn(withEmail, checked)}
            onViewClick={onViewClick}
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
            {withoutEmail.length}
          </span>
        </div>
        {withoutEmail.length > 0 ? (
          <MessagesTable
            messages={withoutEmail}
            selectedIds={selectedIds}
            onToggleId={onToggleId}
            onToggleAll={(checked) => handleToggleAllIn(withoutEmail, checked)}
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
        onToggleAll={onToggleAll}
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
