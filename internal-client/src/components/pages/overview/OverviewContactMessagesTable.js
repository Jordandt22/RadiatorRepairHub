import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import {
  IssueBadge,
  StatusBadge,
  UrgencyBadge,
} from "@/components/pages/dashboard/ContactMessageBadges";

export default function OverviewContactMessagesTable({ messages = [] }) {
  if (!messages.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
        No contact form messages yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {messages.map((message) => (
          <div
            key={message.contact_message_id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <p className="font-medium">{message.name || "—"}</p>
            <p className="truncate text-sm text-muted-foreground">
              {message.business?.title ?? "—"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge status={message.status} />
              <IssueBadge issue={message.issue} />
              <UrgencyBadge urgency={message.urgency} />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(message.created_at)}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">Name</TableHead>
              <TableHead className="w-[22%]">Business</TableHead>
              <TableHead className="w-[14%]">Issue</TableHead>
              <TableHead className="w-[14%]">Urgency</TableHead>
              <TableHead className="w-[14%]">Status</TableHead>
              <TableHead className="w-[18%]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.contact_message_id}>
                <TableCell className="max-w-0 font-medium">
                  <span className="block truncate">
                    {message.name || "—"}
                  </span>
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate">
                    {message.business?.title ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IssueBadge issue={message.issue} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <UrgencyBadge urgency={message.urgency} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={message.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(message.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
