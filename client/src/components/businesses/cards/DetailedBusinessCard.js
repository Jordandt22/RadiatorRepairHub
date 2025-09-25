import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Phone } from "lucide-react";

function DetailedBusinessCard({ business }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-3 overflow-hidden">
      {/* Business Image */}
      <div className="relative w-full h-48 bg-gray-200">
        {business.image_url ? (
          <Image
            src={business.image_url}
            alt={business.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-500 text-sm">No image available</p>
            </div>
          </div>
        )}
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
          <div className="flex gap-2 items-center">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-semibold text-gray-900">
                {business.total_score}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              ({business.reviews_count} reviews)
            </span>
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

            {business.secondary_categories.slice(0, 2).map((category) => (
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

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">{business.phone}</span>
          </div>
          <Link
            href={`/businesses/${business.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 duration-300 hover:scale-105"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DetailedBusinessCard;
