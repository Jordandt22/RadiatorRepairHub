"use client";

import Link from "next/link";
import { MapPin, MoveRight, Phone } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import OpenStatus from "@/components/businesses/status/OpenStatus";
import BusinessImage from "@/components/businesses/BusinessImage";
import ListingBadges from "@/components/businesses/ListingBadges";
import { buttonVariants } from "@/components/ui/button";
import { BUSINESS_FEATURED_CARD_IMAGE_SIZES } from "@/lib/images";
import { trackBusinessStat } from "@/lib/businessStats/trackBusinessStat";
import { cn } from "@/lib/utils";

function buildAboutFallback(business) {
  const category =
    typeof business?.primary_category?.name === "string"
      ? business.primary_category.name
      : "Radiator repair";
  const city =
    typeof business?.city?.name === "string" ? business.city.name : null;
  const stateCode =
    typeof business?.state?.code === "string" ? business.state.code : null;
  const place = [city, stateCode].filter(Boolean).join(", ");
  if (place) {
    return `${category} shop serving drivers in ${place}.`;
  }
  return `${category} shop listed on RadiatorRepairHub.`;
}

function StarRating({ score, title }) {
  const safeScore = Number(score) || 0;
  return (
    <div
      className="flex items-center"
      role="img"
      aria-label={`${safeScore} out of 5 stars`}
    >
      {[...Array(5)].map((_, i) => (
        <svg
          key={`${title}-star-${i}`}
          className={`h-4 w-4 ${i < Math.floor(safeScore) ? "text-yellow-400" : "text-border"
            }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function FeaturedBusinessCard({
  business,
  priority = false,
  listingSource,
  position,
}) {
  const posthog = usePostHog();
  const phone =
    typeof business?.phone === "string" ? business.phone.trim() : "";
  const description =
    typeof business?.description === "string"
      ? business.description.trim()
      : "";
  const about = description || buildAboutFallback(business);
  const reviewsCount = Number(business?.reviews_count) || 0;
  const cityHref =
    business?.state?.code && business?.city?.slug
      ? `/state/${business.state.code}/city/${business.city.slug}`
      : null;

  const trackListingClick = () => {
    if (!business?.id || !listingSource) return;
    trackBusinessStat({
      businessId: business.id,
      event: "listing_click",
      source: listingSource,
      position,
    });
  };

  const trackPhoneClick = () => {
    posthog?.capture("business_phone_clicked", {
      business_id: business?.id || undefined,
      business_name: business?.title || undefined,
      source: listingSource || undefined,
      position,
      placement: "featured_listing_card",
    });
    if (!business?.id) return;
    trackBusinessStat({
      businessId: business.id,
      event: "phone_click",
      source: listingSource,
      position,
    });
  };

  return (
    <article
      className="overflow-hidden rounded-lg shadow-2xl md:shadow-lg bg-card hover:shadow-xl hover:scale-101 hover:-translate-y-1.5 transition-all duration-300"
      role="article"
      aria-label={`Featured business listing for ${business.title}`}
    >
      <div className="flex flex-col md:flex-row">
        <div className="group/image relative h-52 w-full shrink-0 bg-muted md:h-auto md:min-h-[220px] md:w-[280px] lg:w-[320px]">
          <BusinessImage
            src={business.image_url}
            businessId={business.id}
            imageId={business.primary_image_id}
            cdnStored={Boolean(business.cdn_stored)}
            alt={business.title}
            sizes={BUSINESS_FEATURED_CARD_IMAGE_SIZES}
            showIcon={false}
            priority={priority}
          />
          <Link
            href={`/business/${business.slug}`}
            className="absolute inset-0 z-[1] bg-black/0 transition-colors duration-300 group-hover/image:bg-black/50"
            prefetch={false}
            aria-label={`View ${business.title} details`}
            onClick={trackListingClick}
          />
          <ListingBadges
            business={business}
            size="md"
            className="pointer-events-none absolute top-3 left-3 z-10"
          />
          {business?.primary_category?.slug &&
            business?.primary_category?.name ? (
            <Link
              href={`/category/${business.primary_category.slug}`}
              className="absolute bottom-3 left-3 z-10 rounded-md bg-tint px-2 py-1 text-sm font-medium capitalize text-primary hover:bg-white"
              prefetch={false}
            >
              {business.primary_category.name}
            </Link>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            <Link
              href={`/business/${business.slug}`}
              className="hover:text-interactive"
              prefetch={false}
              aria-label={`View ${business.title} details`}
              onClick={trackListingClick}
            >
              {business.title}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StarRating score={business.total_score} title={business.title} />
            <span
              className="text-sm font-bold text-foreground"
              aria-label={`Rating: ${business.total_score} out of 5`}
            >
              {business.total_score}
            </span>
            <span
              className="text-sm text-muted-foreground"
              aria-label={`${reviewsCount.toLocaleString()} reviews`}
            >
              ({reviewsCount.toLocaleString()})
            </span>
            <OpenStatus hours={business.hours} timezone={business.timezone} />
          </div>

          {cityHref ? (
            <Link
              href={cityHref}
              className="mt-2 inline-flex items-start gap-1.5 text-sm text-muted-foreground hover:text-interactive"
              prefetch={false}
              aria-label={`View businesses in ${business.city?.name}, ${business.state?.name}`}
            >
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="line-clamp-2">{business.address}</span>
            </Link>
          ) : (
            <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="line-clamp-2">{business.address}</span>
            </p>
          )}

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {about}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {phone ? (
              <a
                href={`tel:${phone}`}
                onClick={trackPhoneClick}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full"
                )}
              >
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                Call
              </a>
            ) : null}
            <Link
              href={`/business/${business.slug}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full"
              )}
              prefetch={false}
              onClick={trackListingClick}
            >
              View Listing
              <MoveRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
