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
              aria-label="Select all on page"
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
