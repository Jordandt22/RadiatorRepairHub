import {
  CheckIcon,
  ClockIcon,
  FlagIcon,
  MessageCircleOffIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import {
  formatIssueLabel,
  formatStatusLabel,
  formatUrgencyLabel,
  ISSUE_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  URGENCY_BADGE_CLASSES,
} from "@/lib/contact-messages";
import { Badge } from "@/components/ui/badge";

const STATUS_ICONS = {
  pending: ClockIcon,
  approved: CheckIcon,
  sent: SendIcon,
  declined: XIcon,
  no_response: MessageCircleOffIcon,
  flagged: FlagIcon,
};

export function IssueBadge({ issue }) {
  return (
    <Badge
      variant="outline"
      className={ISSUE_BADGE_CLASSES[issue] || ISSUE_BADGE_CLASSES.other}
    >
      {formatIssueLabel(issue)}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status];

  return (
    <Badge
      variant="outline"
      className={
        STATUS_BADGE_CLASSES[status] ||
        "border-transparent bg-zinc-100 text-zinc-700"
      }
    >
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {formatStatusLabel(status)}
    </Badge>
  );
}

export function UrgencyBadge({ urgency }) {
  return (
    <Badge
      variant="outline"
      className={
        URGENCY_BADGE_CLASSES[urgency] ||
        "border-transparent bg-zinc-100 text-zinc-700"
      }
    >
      {formatUrgencyLabel(urgency)}
    </Badge>
  );
}
