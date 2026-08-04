import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Business title (+ optional slug) linking to the internal business detail page.
 */
export default function BusinessTitleLink({
  id,
  title,
  slug,
  className,
  titleClassName,
  slugClassName,
  showSlug = true,
}) {
  const label = title ?? "—";
  const content = (
    <div className="min-w-0">
      <span className={cn("block truncate font-medium", titleClassName)}>
        {label}
      </span>
      {showSlug && slug ? (
        <span
          className={cn(
            "mt-0.5 block truncate text-xs font-normal text-muted-foreground",
            slugClassName,
          )}
        >
          {slug}
        </span>
      ) : null}
    </div>
  );

  if (!id) {
    return <div className={cn("min-w-0", className)}>{content}</div>;
  }

  return (
    <Link
      href={`/businesses/${id}`}
      className={cn(
        "min-w-0 block rounded-sm outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {content}
    </Link>
  );
}
