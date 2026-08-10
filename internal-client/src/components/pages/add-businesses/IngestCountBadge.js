import { CheckIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function IngestCountBadge({ count = 0, tone = "neutral" }) {
  const value = Number(count) || 0;

  if (tone === "info") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-sky-100 text-sky-800 tabular-nums"
      >
        {value}
      </Badge>
    );
  }

  if (tone === "warning") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-amber-100 text-amber-800 tabular-nums"
      >
        {value}
      </Badge>
    );
  }

  if (tone === "success") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-transparent bg-emerald-100 text-emerald-800 tabular-nums",
        )}
      >
        <CheckIcon data-icon="inline-start" />
        {value}
      </Badge>
    );
  }

  if (tone === "danger") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-transparent bg-rose-100 text-rose-800 tabular-nums",
        )}
      >
        <XIcon data-icon="inline-start" />
        {value}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-700 tabular-nums"
    >
      {value}
    </Badge>
  );
}
