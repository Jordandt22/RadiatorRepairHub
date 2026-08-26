import { Star } from "lucide-react";

export default function FeaturedBadge({
  className = "",
  label = "Featured",
  size = "sm",
}) {
  const sizeClasses =
    size === "md" ? "gap-2 px-3 py-1 text-sm" : "gap-1.5 px-3 py-1 text-sm";
  const iconClass = "size-3.5";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-500 font-medium text-white ${sizeClasses} ${className}`}
      aria-label="Featured business"
    >
      <Star className={`${iconClass} shrink-0 fill-current`} aria-hidden="true" />
      {label}
    </span>
  );
}
