import { HandshakeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessPartnerBadge() {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-purple-600 text-white"
    >
      <HandshakeIcon data-icon="inline-start" />
      Partnered
    </Badge>
  );
}
