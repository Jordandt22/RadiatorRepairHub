import { Handshake } from "lucide-react";

export default function PartnerBadge({
  className = "",
  label = "Partnered",
  size = "sm",
}) {
  const sizeClasses =
    size === "md" ? "gap-2 px-3 py-1 text-sm" : "gap-1.5 px-3 py-1 text-sm";
  const iconClass = "size-3.5";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-purple-600 font-medium text-white ${sizeClasses} ${className}`}
      aria-label="Partnered business"
    >
      <Handshake className={`${iconClass} shrink-0`} aria-hidden="true" />
      {label}
    </span>
  );
}
