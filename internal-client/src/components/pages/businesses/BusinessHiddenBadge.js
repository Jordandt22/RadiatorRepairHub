import { EyeOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessHiddenBadge() {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-200 text-zinc-800"
    >
      <EyeOffIcon data-icon="inline-start" />
      Hidden
    </Badge>
  );
}
