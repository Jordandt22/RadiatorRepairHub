import {
  CheckIcon,
  ClockIcon,
  TimerOffIcon,
  XCircleIcon,
} from "lucide-react";

const EMPTY_BY_TAB = {
  pending: {
    icon: ClockIcon,
    title: "No pending claim requests",
    description: "New claim attempts awaiting verification will appear here.",
  },
  success: {
    icon: CheckIcon,
    title: "No successful claims",
    description: "Completed business claims will appear here.",
  },
  failed: {
    icon: XCircleIcon,
    title: "No failed claim requests",
    description: "Claims that hit max attempts or errors will appear here.",
  },
  expired: {
    icon: TimerOffIcon,
    title: "No expired claim requests",
    description: "Stale or manually expired claims will appear here.",
  },
};

export default function ClaimRequestsEmptyState({ activeTab = "pending" }) {
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
