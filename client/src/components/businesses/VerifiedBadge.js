import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({
  className = "",
  label = "Verified",
  size = "sm",
}) {
  const sizeClasses =
    size === "md"
      ? "gap-1.5 px-2.5 py-1 text-xs"
      : "gap-1 px-2 py-0.5 text-[11px]";
  const iconClass = size === "md" ? "size-3.5" : "size-3";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-green-500 font-medium text-white ${sizeClasses} ${className}`}
      aria-label="Verified business"
    >
      <BadgeCheck className={`${iconClass} shrink-0`} aria-hidden="true" />
      {label}
    </span>
  );
}
