import {
  CheckIcon,
  ClockIcon,
  FlagIcon,
  MessageCircleIcon,
  MessageCircleOffIcon,
  SendIcon,
  TimerIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import {
  formatConfirmationLabel,
  formatIssueLabel,
  formatStatusLabel,
  formatUrgencyLabel,
  CONFIRMATION_BADGE_CLASSES,
  ISSUE_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  URGENCY_BADGE_CLASSES,
} from "@/lib/contact-messages";
import { Badge } from "@/components/ui/badge";

const STATUS_ICONS = {
  pending: ClockIcon,
  approved: CheckIcon,
  sent: SendIcon,
  responded: MessageCircleIcon,
  declined: XIcon,
  no_response: MessageCircleOffIcon,
  flagged: FlagIcon,
};

const URGENCY_ICONS = {
  1: ZapIcon,
  2: TimerIcon,
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
  const Icon = URGENCY_ICONS[urgency];

  return (
    <Badge
      variant="outline"
      className={
        URGENCY_BADGE_CLASSES[urgency] ||
        "border-transparent bg-zinc-100 text-zinc-700"
      }
    >
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {formatUrgencyLabel(urgency)}
    </Badge>
  );
}

export function ConfirmationBadge({ confirmationSent }) {
  const confirmed = Boolean(confirmationSent);
  const Icon = confirmed ? CheckIcon : ClockIcon;

  return (
    <Badge
      variant="outline"
      className={CONFIRMATION_BADGE_CLASSES[confirmed]}
    >
      <Icon data-icon="inline-start" />
      {formatConfirmationLabel(confirmed)}
    </Badge>
  );
}
