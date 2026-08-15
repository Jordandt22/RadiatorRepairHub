import {
  BadgeCheckIcon,
  CheckCircle2Icon,
  CopyIcon,
  MailXIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CLAIM_ELIGIBILITY_LABELS } from "@/components/pages/outreach/outreachConstants";

const STYLES = {
  able: {
    className: "border-transparent bg-emerald-100 text-emerald-800",
    icon: CheckCircle2Icon,
  },
  claimed: {
    className: "border-transparent bg-sky-100 text-sky-800",
    icon: BadgeCheckIcon,
  },
  no_email: {
    className: "border-transparent bg-zinc-100 text-zinc-700",
    icon: MailXIcon,
  },
  email_review: {
    className: "border-transparent bg-amber-100 text-amber-900",
    icon: ShieldAlertIcon,
  },
  duplicate_email: {
    className: "border-transparent bg-amber-100 text-amber-900",
    icon: CopyIcon,
  },
};

export default function ClaimEligibilityBadge({ eligibility }) {
  const key = eligibility && STYLES[eligibility] ? eligibility : "no_email";
  const style = STYLES[key];
  const Icon = style.icon;
  const label = CLAIM_ELIGIBILITY_LABELS[key] ?? "Unknown";

  return (
    <Badge variant="outline" className={style.className}>
      <Icon data-icon="inline-start" />
      {label}
    </Badge>
  );
}
