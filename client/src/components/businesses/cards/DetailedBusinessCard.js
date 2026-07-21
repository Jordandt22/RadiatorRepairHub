import React from "react";
import Link from "next/link";
import { MapPin, Star, Send, MoveRight } from "lucide-react";
import OpenStatus from "@/components/businesses/status/OpenStatus";
import BusinessImage from "@/components/businesses/BusinessImage";
import QuickContactDialog from "@/components/businesses/QuickContactDialog";
import { Button } from "@/components/ui/button";

function DetailedBusinessCard({ business }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-3 overflow-hidden">
      {/* Business Image */}
      <div className="relative w-full h-48 bg-gray-200">
        <BusinessImage
          src={business.image_url}
          alt={business.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </div>

      <div className="p-6">
        <div className="flex flex-col items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1 font-heading line-clamp-1">
              {business.title}
            </h3>
            <Link
              href={`/state/${business.state.code}/city/${business.city.slug}`}
              className="flex items-center text-gray-600 mb-2 hover:text-blue-600 duration-300"
            >
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{business.address}</span>
            </Link>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-semibold text-gray-900">
                {business.total_score}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              ({business.reviews_count} reviews)
            </span>
            <OpenStatus hours={business.hours} timezone={business.timezone} />
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
          {business.description}
        </p>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/search?primary_category_id=${business.primary_category.id}`}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize hover:bg-blue-500 hover:text-white duration-300"
            >
              {business.primary_category.name}
            </Link>

            {Array.isArray(business.secondary_categories) &&
              business.secondary_categories.slice(0, 2).map((category) => (
                <Link
                  href={`/search?secondary_categories=${category.id}`}
                  key={business.id + "-" + category.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize hover:bg-blue-500 hover:text-white duration-300"
                >
                  {category.name}
                </Link>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100">
          <QuickContactDialog
            businessId={business.id}
            businessName={business.title}
            email={business.email}
            phone={business.phone}
            trigger={
              <Button
                type="button"
                className="h-9 gap-1.5 bg-blue-600 text-white hover:bg-blue-600 cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-200 px-8"
              />
            }
          >
            <Send className="size-3.5" />
            Contact
          </QuickContactDialog>
          <Link
            href={`/business/${business.slug}`}
            className="inline-flex items-center gap-1.5 bg-secondary px-4 py-2 rounded-full text-sm font-medium hover:shadow-md duration-300 hover:scale-105"
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
