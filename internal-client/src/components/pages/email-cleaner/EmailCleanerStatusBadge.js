import {
  CheckCircle2Icon,
  CircleHelpIcon,
  SearchXIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EMAIL_STATUS_LABELS } from "@/components/pages/email-cleaner/EmailCleanerMarkStatusDialog";

const STYLES = {
  suspicious: {
    className: "border-transparent bg-amber-100 text-amber-900",
    icon: ShieldAlertIcon,
  },
  checked: {
    className: "border-transparent bg-emerald-100 text-emerald-800",
    icon: CheckCircle2Icon,
  },
  unable_to_find: {
    className: "border-transparent bg-rose-100 text-rose-800",
    icon: SearchXIcon,
  },
  not_checked: {
    className: "border-transparent bg-zinc-100 text-zinc-700",
    icon: CircleHelpIcon,
  },
};

export default function EmailCleanerStatusBadge({ status }) {
  const key = status && STYLES[status] ? status : "not_checked";
  const style = STYLES[key];
  const Icon = style.icon;
  const label = EMAIL_STATUS_LABELS[key] ?? "Not Checked";

  return (
    <Badge variant="outline" className={style.className}>
      <Icon data-icon="inline-start" />
      {label}
    </Badge>
  );
}
