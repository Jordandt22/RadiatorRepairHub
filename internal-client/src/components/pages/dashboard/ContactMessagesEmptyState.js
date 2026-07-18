import {
  CheckIcon,
  FlagIcon,
  InboxIcon,
  SendIcon,
} from "lucide-react";

const EMPTY_BY_TAB = {
  all: {
    icon: InboxIcon,
    title: "No contact messages",
    description: "New submissions will show up here.",
  },
  approved: {
    icon: CheckIcon,
    title: "No approved messages",
    description: "Approve messages from All or Flagged to see them here.",
  },
  flagged: {
    icon: FlagIcon,
    title: "No flagged messages",
    description: "Flagged messages that need review will appear here.",
  },
  sent: {
    icon: SendIcon,
    title: "No sent messages",
    description: "Messages emailed to businesses will show up here.",
  },
};

export default function ContactMessagesEmptyState({ activeTab = "all" }) {
  const content = EMPTY_BY_TAB[activeTab] ?? EMPTY_BY_TAB.all;
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{content.title}</p>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </div>
    </div>
  );
}
