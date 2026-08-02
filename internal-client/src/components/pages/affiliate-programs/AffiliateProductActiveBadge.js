import { BadgeCheckIcon, CircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AffiliateProductActiveBadge({ isActive }) {
  if (isActive) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-emerald-100 text-emerald-800"
      >
        <BadgeCheckIcon data-icon="inline-start" />
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-700"
    >
      <CircleIcon data-icon="inline-start" />
      Inactive
    </Badge>
  );
}
