import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getScorePillClass(score) {
  if (score == null || Number.isNaN(score)) {
    return "border-transparent bg-zinc-100 text-zinc-700";
  }
  if (score < 3) return "border-transparent bg-red-100 text-red-800";
  if (score < 3.5) return "border-transparent bg-orange-100 text-orange-800";
  if (score < 4) return "border-transparent bg-yellow-100 text-yellow-800";
  if (score < 4.5) return "border-transparent bg-sky-100 text-sky-800";
  return "border-transparent bg-emerald-100 text-emerald-800";
}

function formatScore(score) {
  if (score == null || Number.isNaN(Number(score))) return "—";
  return Number(score).toFixed(1);
}

export default function BusinessScoreBadge({ score, className }) {
  const num = score == null ? null : Number(score);

  return (
    <Badge
      variant="outline"
      className={cn(
        "tabular-nums",
        getScorePillClass(num),
        className,
      )}
      aria-label={
        num == null || Number.isNaN(num)
          ? "No score"
          : `Score ${formatScore(num)} out of 5`
      }
    >
      <StarIcon data-icon="inline-start" className="fill-current" />
      {formatScore(num)}
    </Badge>
  );
}
