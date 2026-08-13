import React from "react";
import Link from "next/link";
import { MapPin, Star, Send, MoveRight } from "lucide-react";
import OpenStatus from "@/components/businesses/status/OpenStatus";
import BusinessImage from "@/components/businesses/BusinessImage";
import QuickContactDialog from "@/components/businesses/QuickContactDialog";
import VerifiedBadge from "@/components/businesses/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { BUSINESS_CARD_IMAGE_SIZES } from "@/lib/images";

function DetailedBusinessCard({ business }) {
  return (
    <div className="bg-card rounded-lg border border-border hover:border-interactive/50 transition-colors duration-300 overflow-hidden">
      {/* Business Image */}
      <div className="relative w-full h-48 bg-muted">
        <BusinessImage
          src={business.image_url}
          businessId={business.id}
          imageId={business.primary_image_id}
          cdnStored={Boolean(business.cdn_stored)}
          alt={business.title}
          sizes={BUSINESS_CARD_IMAGE_SIZES}
        />
        {business.is_claimed ? (
          <div className="absolute top-3 left-3 z-10">
            <VerifiedBadge size="md" />
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <div className="flex flex-col items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1 font-heading line-clamp-1">
              {business.title}
            </h3>
            <Link
              href={`/state/${business.state.code}/city/${business.city.slug}`}
              className="flex items-center text-muted-foreground mb-2 hover:text-interactive duration-300"
            >
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{business.address}</span>
            </Link>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
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

        <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
          {business.description}
        </p>

        <div className="mb-4">
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

        <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
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
