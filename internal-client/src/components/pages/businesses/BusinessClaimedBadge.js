import { BadgeCheckIcon, CircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessClaimedBadge({ isClaimed }) {
  if (isClaimed) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-emerald-100 text-emerald-800"
      >
        <BadgeCheckIcon data-icon="inline-start" />
        Claimed
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-700"
    >
      <CircleIcon data-icon="inline-start" />
      Unclaimed
    </Badge>
  );
}
