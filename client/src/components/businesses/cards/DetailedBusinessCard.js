import React from "react";
import Link from "next/link";
import { MapPin, Star, Send, MoveRight } from "lucide-react";
import OpenStatus from "@/components/businesses/status/OpenStatus";
import BusinessImage from "@/components/businesses/BusinessImage";
import QuickContactDialog from "@/components/businesses/QuickContactDialog";
import VerifiedBadge from "@/components/businesses/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { BUSINESS_CARD_IMAGE_SIZES } from "@/lib/images";

function DetailedBusinessCard({ business, priority = false }) {
  return (
    <div className="card-lift-hover flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      {/* Business Image */}
      <div className="relative h-48 w-full shrink-0 bg-muted">
        <BusinessImage
          src={business.image_url}
          businessId={business.id}
          imageId={business.primary_image_id}
          cdnStored={Boolean(business.cdn_stored)}
          alt={business.title}
          sizes={BUSINESS_CARD_IMAGE_SIZES}
          priority={priority}
        />
        {business.is_claimed ? (
          <div className="absolute top-3 left-3 z-10">
            <VerifiedBadge size="md" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-col items-start justify-between">
          <div className="w-full">
            <h3 className="mb-1 line-clamp-1 font-heading text-xl font-semibold text-foreground">
              {business.title}
            </h3>
            <Link
              href={`/state/${business.state.code}/city/${business.city.slug}`}
              className="mb-2 flex items-start text-muted-foreground duration-300 hover:text-interactive"
            >
              <MapPin className="mr-1 mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-clamp-2 text-sm">{business.address}</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-semibold text-foreground">
                {business.total_score}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({business.reviews_count} reviews)
            </span>
            <OpenStatus hours={business.hours} timezone={business.timezone} />
          </div>
        </div>

        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {business.description}
        </p>

        <div className="mb-4 min-h-[1.75rem]">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/search?primary_category_id=${business.primary_category.id}`}
              className="px-3 py-1 bg-tint text-primary text-xs rounded-full capitalize hover:bg-secondary duration-300"
            >
              {business.primary_category.name}
            </Link>

            {Array.isArray(business.secondary_categories) &&
              business.secondary_categories.slice(0, 2).map((category) => (
                <Link
                  href={`/search?secondary_categories=${category.id}`}
                  key={business.id + "-" + category.id}
                  className="px-3 py-1 bg-tint text-primary text-xs rounded-full capitalize hover:bg-secondary duration-300"
                >
                  {category.name}
                </Link>
              ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
          <QuickContactDialog
            businessId={business.id}
            businessName={business.title}
            email={business.email}
            phone={business.phone}
            trigger={
              <Button
                type="button"
                className="h-9 gap-1.5 cursor-pointer px-8"
              />
            }
          >
            <Send className="size-3.5" />
            Contact
          </QuickContactDialog>
          <Link
            href={`/business/${business.slug}`}
            className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-tint duration-300"
          >
            View Details
            <MoveRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DetailedBusinessCard;
