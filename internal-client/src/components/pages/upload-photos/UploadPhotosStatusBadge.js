import {
  CheckIcon,
  ClockIcon,
  LoaderIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    Icon: ClockIcon,
    className: "border-transparent bg-zinc-100 text-zinc-700",
  },
  running: {
    label: "Running",
    Icon: LoaderIcon,
    className: "border-transparent bg-amber-100 text-amber-800",
  },
  completed: {
    label: "Completed",
    Icon: CheckIcon,
    className: "border-transparent bg-emerald-100 text-emerald-800",
  },
  failed: {
    label: "Failed",
    Icon: XCircleIcon,
    className: "border-transparent bg-rose-100 text-rose-800",
  },
  succeeded: {
    label: "Succeeded",
    Icon: CheckIcon,
    className: "border-transparent bg-emerald-100 text-emerald-800",
  },
  skipped: {
    label: "Skipped",
    Icon: ClockIcon,
    className: "border-transparent bg-zinc-100 text-zinc-700",
  },
};

export default function UploadPhotosStatusBadge({ status }) {
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
