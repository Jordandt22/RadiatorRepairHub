import { Badge } from "@/components/ui/badge";
import { OUTREACH_TYPE_LABELS } from "@/components/pages/outreach/outreachConstants";

export default function ClaimInviteTypeBadge({ type }) {
  if (!type) {
    return <span className="text-sm">—</span>;
  }

  const label = OUTREACH_TYPE_LABELS[type] ?? type;
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-800"
      title={label}
    >
      <span className="truncate">{label}</span>
    </Badge>
  );
}
