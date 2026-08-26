import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  active: {
    label: "Active",
    className: "border-transparent bg-green-100 text-green-800",
  },
  trialing: {
    label: "Trialing",
    className: "border-transparent bg-sky-100 text-sky-800",
  },
  past_due: {
    label: "Past due",
    className: "border-transparent bg-amber-100 text-amber-900",
  },
  unpaid: {
    label: "Unpaid",
    className: "border-transparent bg-red-100 text-red-800",
  },
  canceled: {
    label: "Canceled",
    className: "border-transparent bg-zinc-100 text-zinc-700",
  },
  incomplete: {
    label: "Incomplete",
    className: "border-transparent bg-orange-100 text-orange-800",
  },
  incomplete_expired: {
    label: "Expired",
    className: "border-transparent bg-zinc-100 text-zinc-700",
  },
};

export default function BusinessSubscriptionStatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? {
    label: status || "Unknown",
    className: "border-transparent bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={style.className}>
      {style.label}
    </Badge>
  );
}
