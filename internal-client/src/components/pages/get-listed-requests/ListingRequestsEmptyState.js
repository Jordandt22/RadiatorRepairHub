import {
  CheckIcon,
  ClockIcon,
  CopyIcon,
  XCircleIcon,
} from "lucide-react";

const EMPTY_BY_TAB = {
  pending: {
    icon: ClockIcon,
    title: "No pending listing requests",
    description: "New Get Listed submissions will appear here.",
  },
  listed: {
    icon: CheckIcon,
    title: "No listed requests",
    description: "Requests you mark as listed will appear here.",
  },
  rejected: {
    icon: XCircleIcon,
    title: "No rejected requests",
    description: "Requests you reject will appear here.",
  },
  duplicate: {
    icon: CopyIcon,
    title: "No duplicate requests",
    description: "Requests you mark as duplicate will appear here.",
  },
};

export default function ListingRequestsEmptyState({ activeTab = "pending" }) {
  const content = EMPTY_BY_TAB[activeTab] ?? EMPTY_BY_TAB.pending;
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
