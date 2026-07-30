import {
  CheckIcon,
  ClockIcon,
  TimerOffIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    Icon: ClockIcon,
    className: "border-transparent bg-amber-100 text-amber-800",
  },
  success: {
    label: "Success",
    Icon: CheckIcon,
    className: "border-transparent bg-emerald-100 text-emerald-800",
  },
  failed: {
    label: "Failed",
    Icon: XCircleIcon,
    className: "border-transparent bg-red-100 text-red-800",
  },
  expired: {
    label: "Expired",
    Icon: TimerOffIcon,
    className: "border-transparent bg-zinc-100 text-zinc-700",
  },
};

export default function ClaimRequestStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    Icon: null,
    className: "border-transparent bg-zinc-100 text-zinc-700",
  };
  const Icon = config.Icon;

  return (
    <Badge variant="outline" className={config.className}>
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {config.label}
    </Badge>
  );
}
