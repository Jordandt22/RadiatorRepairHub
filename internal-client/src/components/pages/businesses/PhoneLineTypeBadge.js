import { Badge } from "@/components/ui/badge";
import { PHONE_LINE_TYPE_FILTERS } from "@/lib/businessTiers";

const LINE_TYPE_LABELS = Object.fromEntries(
  PHONE_LINE_TYPE_FILTERS.map((item) => [item.id, item.label]),
);

const LINE_TYPE_STYLES = {
  landline: "border-transparent bg-sky-100 text-sky-800",
  mobile: "border-transparent bg-emerald-100 text-emerald-800",
  fixedVoip: "border-transparent bg-violet-100 text-violet-800",
  nonFixedVoip: "border-transparent bg-violet-100 text-violet-800",
  tollFree: "border-transparent bg-amber-100 text-amber-900",
  personal: "border-transparent bg-teal-100 text-teal-800",
  unknown: "border-transparent bg-zinc-100 text-zinc-700",
  empty: "border-transparent bg-zinc-100 text-zinc-700",
  unchecked: "border-transparent bg-zinc-100 text-zinc-600",
  premium: "border-transparent bg-rose-100 text-rose-800",
  sharedCost: "border-transparent bg-rose-100 text-rose-800",
  uan: "border-transparent bg-rose-100 text-rose-800",
  voicemail: "border-transparent bg-rose-100 text-rose-800",
  pager: "border-transparent bg-rose-100 text-rose-800",
};

function lineTypeState(row) {
  if (!row?.phone_line_type_checked_at) {
    return { key: "unchecked", label: "Not checked" };
  }
  if (!row.phone_line_type) {
    return { key: "empty", label: "No type" };
  }
  return {
    key: row.phone_line_type,
    label: LINE_TYPE_LABELS[row.phone_line_type] ?? row.phone_line_type,
  };
}

export default function PhoneLineTypeBadge({ row }) {
  const { key, label } = lineTypeState(row);
  return (
    <Badge
      variant="outline"
      className={
        LINE_TYPE_STYLES[key] ?? "border-transparent bg-zinc-100 text-zinc-700"
      }
    >
      {label}
    </Badge>
  );
}
