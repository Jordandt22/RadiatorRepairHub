import { BadgeCheckIcon, CircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ROLE_STYLES = {
  business_owner: {
    label: "Business owner",
    className: "border-transparent bg-sky-100 text-sky-800",
    icon: BadgeCheckIcon,
  },
};

function formatRoleLabel(role) {
  if (!role || typeof role !== "string") return "—";
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function UserRoleBadge({ role }) {
  if (!role || typeof role !== "string") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-zinc-100 text-zinc-700"
      >
        <CircleIcon data-icon="inline-start" />
        —
      </Badge>
    );
  }

  const style = ROLE_STYLES[role] ?? {
    label: formatRoleLabel(role),
    className: "border-transparent bg-zinc-100 text-zinc-700",
    icon: CircleIcon,
  };
  const Icon = style.icon;

  return (
    <Badge variant="outline" className={style.className}>
      <Icon data-icon="inline-start" />
      {style.label}
    </Badge>
  );
}
