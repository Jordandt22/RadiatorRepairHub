import {
  CheckIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";

const EMPTY_BY_TAB = {
  pending: {
    icon: ClockIcon,
    title: "No pending listing reports",
    description: "New reports from visitors and claim attempts will appear here.",
  },
  resolved: {
    icon: CheckIcon,
    title: "No resolved listing reports",
    description: "Reports you mark as resolved will appear here.",
  },
  dismissed: {
    icon: XCircleIcon,
    title: "No dismissed listing reports",
    description: "Reports you dismiss will appear here.",
  },
};

export default function ListingReportsEmptyState({ activeTab = "pending" }) {
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
