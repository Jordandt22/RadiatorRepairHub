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
  filtering: {
    label: "Filtering",
    Icon: LoaderIcon,
    className: "border-transparent bg-sky-100 text-sky-800",
  },
  processing: {
    label: "Processing",
    Icon: LoaderIcon,
    className: "border-transparent bg-amber-100 text-amber-800",
  },
  enriching: {
    label: "Enriching",
    Icon: LoaderIcon,
    className: "border-transparent bg-violet-100 text-violet-800",
  },
  inserting: {
    label: "Inserting",
    Icon: LoaderIcon,
    className: "border-transparent bg-indigo-100 text-indigo-800",
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
};

export default function IngestStatusBadge({ status }) {
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
