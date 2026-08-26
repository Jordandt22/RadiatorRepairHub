'use client';

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Icons
import { Info, Clock } from "lucide-react";

// Components
import OpenStatus from "@/components/businesses/status/OpenStatus";
import BusinessImage from "@/components/businesses/BusinessImage";
import ListingBadges from "@/components/businesses/ListingBadges";
import { BUSINESS_CARD_IMAGE_SIZES } from "@/lib/images";
import { trackBusinessStat } from "@/lib/businessStats/trackBusinessStat";

function BusinessCard({
  business,
  setActiveCard,
  setActiveBackCard,
  priority = false,
  listingSource,
  position,
}) {
  const router = useRouter();
  const trackListingClick = () => {
    if (!business?.id || !listingSource) return;
    trackBusinessStat({
      businessId: business.id,
      event: "listing_click",
      source: listingSource,
      position,
    });
  };
  const buttonStyle =
    "group/hours cursor-pointer rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-interactive hover:bg-primary";
  const iconStyle = "w-5 h-5 text-muted-foreground group-hover/hours:text-white";

  return (
    <article
      className="card-lift-hover hidden md:block h-full overflow-hidden rounded-lg border border-border bg-card"
      role="article"
      aria-label={`Business listing for ${business.title}`}
    >
      <div className="group/image relative w-full h-56 bg-muted">
        <BusinessImage
          src={business.image_url}
          businessId={business.id}
          imageId={business.primary_image_id}
          cdnStored={Boolean(business.cdn_stored)}
          alt={business.title}
          sizes={BUSINESS_CARD_IMAGE_SIZES}
          showIcon={false}
          priority={priority}
        />

        {/* Subtle black overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/50  transition-all duration-300 cursor-pointer" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          trackListingClick();
          router.push(`/business/${business.slug}`);
        }}>
          <div className="hidden absolute top-3 right-3 z-20 group-hover/image:flex transition-all duration-200 flex-col gap-2">
            {/* Business Info */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveCard(business.id);
                setActiveBackCard(1);
              }}
              className={buttonStyle}
              aria-label="Toggle business info"
            >
              <Info className={iconStyle} />
            </button>

            {/* Opening Hours */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveCard(business.id);
                setActiveBackCard(2);
              }}
              className={buttonStyle}
              aria-label="Toggle business hours"
            >
              <Clock className={iconStyle} />
            </button>
          </div>

          <Link
            key={"business-card-category-" + business.id}
            href={`/category/${business.primary_category.slug}`}
            className="absolute bottom-3 left-3 text-sm font-medium text-primary bg-tint px-2 py-1 rounded-md hover:bg-white duration-200 capitalize"
            prefetch={false}
          >
            {business.primary_category.name}
          </Link>
          <ListingBadges
            business={business}
            className="absolute top-3 left-3 z-10"
          />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 font-heading text-lg">
          <Link
            href={`/business/${business.slug}`}
            className="hover:text-interactive duration-200"
            prefetch={false}
            aria-label={`View ${business.title} details`}
            onClick={trackListingClick}
          >
            {business.title}
          </Link>
        </h3>
        <div className="flex items-center mb-1 flex-wrap gap-2">
          <div
            className="flex items-center"
            role="img"
            aria-label={`${business.total_score} out of 5 stars`}
          >
            {[...Array(5)].map((_, i) => (
              <svg
                key={business.title + "-" + i}
                className={`w-4 h-4 ${i < Math.floor(business.total_score)
                  ? "text-yellow-400"
                  : "text-border"
                  }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span
            className="text-sm text-foreground font-bold"
            aria-label={`Rating: ${business.total_score} out of 5`}
          >
            {business.total_score}
          </span>
          <span
            className="text-sm text-muted-foreground"
            aria-label={`${business.reviews_count.toLocaleString()} reviews`}
          >
            ({business.reviews_count.toLocaleString()})
          </span>
        </div>

        <Link
          href={`/state/${business.state.code}/city/${business.city.slug}`}
          className="text-sm text-muted-foreground hover:text-interactive"
          prefetch={false}
          aria-label={`View businesses in ${business.city.name}, ${business.state.name}`}
        >
          {business.address}
        </Link>
        <div className="mt-2">
          <OpenStatus hours={business.hours} timezone={business.timezone} />
        </div>
      </div>
    </article>
  );
}

export default BusinessCard;
