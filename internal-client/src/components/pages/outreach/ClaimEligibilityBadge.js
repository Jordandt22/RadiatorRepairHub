import {
  BadgeCheckIcon,
  CheckCircle2Icon,
  CopyIcon,
  MailCheckIcon,
  MailXIcon,
  PhoneCallIcon,
  PhoneOffIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CLAIM_ELIGIBILITY_LABELS } from "@/components/pages/outreach/outreachConstants";

const STYLES = {
  both_able: {
    className: "border-transparent bg-emerald-100 text-emerald-800",
    icon: CheckCircle2Icon,
  },
  email_able: {
    className: "border-transparent bg-teal-100 text-teal-800",
    icon: MailCheckIcon,
  },
  phone_able: {
    className: "border-transparent bg-cyan-100 text-cyan-800",
    icon: PhoneCallIcon,
  },
  claimed: {
    className: "border-transparent bg-sky-100 text-sky-800",
    icon: BadgeCheckIcon,
  },
  no_contact: {
    className: "border-transparent bg-zinc-100 text-zinc-700",
    icon: MailXIcon,
  },
  email_review: {
    className: "border-transparent bg-amber-100 text-amber-900",
    icon: ShieldAlertIcon,
  },
  phone_review: {
    className: "border-transparent bg-orange-100 text-orange-900",
    icon: PhoneOffIcon,
  },
  duplicate_email: {
    className: "border-transparent bg-amber-100 text-amber-900",
    icon: CopyIcon,
  },
  duplicate_phone: {
    className: "border-transparent bg-amber-100 text-amber-900",
    icon: CopyIcon,
  },
};

export default function ClaimEligibilityBadge({ eligibility }) {
  const key = eligibility && STYLES[eligibility] ? eligibility : "no_contact";
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
