import { MessageSquareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getReviewsPillClass(count) {
  if (count == null || Number.isNaN(count)) {
    return "border-transparent bg-zinc-100 text-zinc-700";
  }
  if (count < 5) return "border-transparent bg-red-100 text-red-800";
  if (count < 15) return "border-transparent bg-orange-100 text-orange-800";
  if (count < 30) return "border-transparent bg-yellow-100 text-yellow-800";
  if (count < 50) return "border-transparent bg-sky-100 text-sky-800";
  return "border-transparent bg-emerald-100 text-emerald-800";
}

function formatReviews(count) {
  if (count == null || Number.isNaN(Number(count))) return "—";
  return Number(count).toLocaleString();
}

export default function BusinessReviewsBadge({ count, className }) {
  const num = count == null ? null : Number(count);

  return (
    <Badge
      variant="outline"
      className={cn(
        "tabular-nums",
        getReviewsPillClass(num),
        className,
      )}
      aria-label={
        num == null || Number.isNaN(num)
          ? "No reviews"
          : `${formatReviews(num)} reviews`
      }
    >
      <MessageSquareIcon data-icon="inline-start" />
      {formatReviews(num)}
    </Badge>
  );
}
