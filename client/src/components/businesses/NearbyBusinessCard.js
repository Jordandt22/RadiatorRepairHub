"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import BusinessImage from "@/components/businesses/BusinessImage";
import ListingBadges from "@/components/businesses/ListingBadges";
import BusinessListingImpression from "@/components/businesses/stats/BusinessListingImpression";
import { LISTING_SOURCES } from "@/lib/businessStats/listingSurface";
import { trackBusinessStat } from "@/lib/businessStats/trackBusinessStat";

const NEARBY_IMAGE_SIZES = "(max-width: 768px) 96px, 96px";

function RatingSummary({ score, reviews }) {
  const rating = Number(score);
  const reviewCount = Number(reviews);
  const hasRating = Number.isFinite(rating) && rating > 0;

  if (!hasRating) return null;

  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Star className="size-4 fill-current text-yellow-400" aria-hidden="true" />
      <span className="font-medium text-foreground">{rating}</span>
      {reviewCount > 0 ? (
        <span>({reviewCount.toLocaleString()})</span>
      ) : null}
    </span>
  );
}

function RatingAndBadges({ business }) {
  const hasRating =
    Number.isFinite(Number(business?.total_score)) &&
    Number(business.total_score) > 0;
  const hasBadges = Boolean(business?.is_claimed || business?.is_featured);

  if (!hasRating && !hasBadges) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <RatingSummary
        score={business.total_score}
        reviews={business.reviews_count}
      />
      <ListingBadges business={business} size="sm" />
    </div>
  );
}

export default function NearbyBusinessCard({ business, position }) {
  const trackListingClick = () => {
    if (!business?.id) return;
    trackBusinessStat({
      businessId: business.id,
      event: "listing_click",
      source: LISTING_SOURCES.NEARBY,
      position,
    });
  };

  return (
    <BusinessListingImpression
      businessId={business.id}
      source={LISTING_SOURCES.NEARBY}
      position={position}
    >
      <div className="group relative flex h-full gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-interactive sm:p-5 hover:-translate-y-2 hover:shadow-lg">
        <Link
          href={`/business/${business.slug}`}
          className="absolute inset-0 z-0 rounded-lg"
          aria-label={`View ${business.title} details`}
          onClick={trackListingClick}
        />

        <div className="pointer-events-none relative z-[1] size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24">
          <BusinessImage
            src={business.image_url}
            businessId={business.id}
            imageId={business.primary_image_id}
            cdnStored={Boolean(business.cdn_stored)}
            alt={business.title}
            sizes={NEARBY_IMAGE_SIZES}
            fallback="placeholder"
          />
        </div>

        <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-base font-semibold text-foreground transition-colors group-hover:text-primary md:text-lg">
              {business.title}
            </h3>
            <ArrowRight
              className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </div>

          <RatingAndBadges business={business} />

          {business.primary_category?.slug && business.primary_category?.name ? (
            <Link
              href={`/category/${business.primary_category.slug}`}
              className="pointer-events-auto relative z-10 inline-flex w-fit rounded-md border border-primary/20 bg-tint px-2 py-0.5 text-xs font-medium capitalize text-primary transition-all hover:bg-secondary hover:scale-105"
              prefetch={false}
            >
              {business.primary_category.name}
            </Link>
          ) : null}

          {business.address ? (
            <p className="mt-auto flex items-start gap-2 pt-1 text-sm text-muted-foreground">
              <MapPin
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="line-clamp-2">{business.address}</span>
            </p>
          ) : null}
        </div>
      </div>
    </BusinessListingImpression>
  );
}
