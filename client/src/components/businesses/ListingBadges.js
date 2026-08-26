import FeaturedBadge from "@/components/businesses/FeaturedBadge";
import VerifiedBadge from "@/components/businesses/VerifiedBadge";

export default function ListingBadges({
  business,
  size = "sm",
  className = "",
}) {
  const isFeatured = Boolean(business?.is_featured);
  const isClaimed = Boolean(business?.is_claimed);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {isFeatured ? <FeaturedBadge size={size} /> : null}
      {isClaimed ? <VerifiedBadge size={size} /> : null}
    </div>
  );
}
