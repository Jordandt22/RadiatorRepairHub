import FeaturedBadge from "@/components/businesses/FeaturedBadge";
import PartnerBadge from "@/components/businesses/PartnerBadge";
import VerifiedBadge from "@/components/businesses/VerifiedBadge";

export default function ListingBadges({
  business,
  size = "sm",
  className = "",
}) {
  const isFeatured = Boolean(business?.is_featured);
  const isPartner = Boolean(business?.is_partner);
  const isClaimed = Boolean(business?.is_claimed);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {isPartner ? <PartnerBadge size={size} /> : null}
      {isFeatured && !isPartner ? <FeaturedBadge size={size} /> : null}
      {isClaimed ? <VerifiedBadge size={size} /> : null}
    </div>
  );
}
