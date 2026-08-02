import { Badge } from "@/components/ui/badge";

const PROVIDER_LABELS = {
  amazon: "Amazon",
};

export default function AffiliateProductProviderBadge({ provider }) {
  const label = PROVIDER_LABELS[provider] ?? provider ?? "—";

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-800"
    >
      {label}
    </Badge>
  );
}
