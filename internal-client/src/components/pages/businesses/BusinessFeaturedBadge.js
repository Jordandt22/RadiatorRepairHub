import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessFeaturedBadge({ isFeatured }) {
  if (isFeatured) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-amber-100 text-amber-900"
      >
        <StarIcon data-icon="inline-start" />
        Featured
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-700"
    >
      Not featured
    </Badge>
  );
}
