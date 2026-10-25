import Link from "next/link";
import { getConfig } from "@/lib/config";
import { StarRow } from "@/components/pages/shared/StarRow";

/**
 * The rating, once, under the hero CTAs. Jumps to the quotes further down the
 * page; the trust strip deliberately carries different facts.
 */
export function GoogleRatingLine({ className = "" }) {
  const { reviews } = getConfig();
  if (reviews?.rating == null || reviews?.count == null) return null;

  return (
    <p className={`m-0 ${className}`.trim()}>
      <Link
        href="/#reviews"
        className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 font-semibold text-ink! no-underline! hover:text-accent-text!"
      >
        <StarRow rating={reviews.rating} />
        <span className="tabular-nums">
          {reviews.rating} stars from {reviews.count} Google reviews
        </span>
      </Link>
    </p>
  );
}
