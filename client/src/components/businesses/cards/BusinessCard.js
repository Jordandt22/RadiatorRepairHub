import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, Clock, ExternalLink } from "lucide-react";
import OpenStatus from "@/components/businesses/status/OpenStatus";

function BusinessCard({ business, setActiveCard, setActiveBackCard }) {
  const buttonStyle =
    "group/hours bg-white/80 hover:bg-blue-500 rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm cursor-pointer";
  const iconStyle = "w-5 h-5 text-gray-600 group-hover/hours:text-white";

  return (
    <article
      className="hidden md:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-full hover:shadow-lg hover:-translate-y-1 hover:scale-102 transition-all duration-300"
      role="article"
      aria-label={`Business listing for ${business.title}`}
    >
      <div className="group/image relative w-full h-56 bg-gray-200">
        {business.image_url ? (
          <Image
            src={business.image_url}
            alt={business.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200">
            <p className="text-gray-500 text-center">No image available</p>
          </div>
        )}

        {/* Subtle black overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/50  transition-all duration-300">
          <div className="hidden absolute top-3 right-3 z-20 group-hover/image:flex transition-all duration-200 flex-col gap-2">
            {/* Business Info */}
            <button
              onClick={() => {
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
              onClick={() => {
                setActiveCard(business.id);
                setActiveBackCard(2);
              }}
              className={buttonStyle}
              aria-label="Toggle business hours"
            >
              <Clock className={iconStyle} />
            </button>

            {/* Link to business */}
            <Link
              href={`/business/${business.slug}`}
              className={buttonStyle}
              aria-label="View business details"
              prefetch={false}
            >
              <ExternalLink className={iconStyle} />
            </Link>
          </div>

          <Link
            key={"business-card-category-" + business.id}
            href={`/category/${business.primary_category.slug}`}
            className="absolute bottom-3 left-3 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white duration-200 capitalize"
            prefetch={false}
          >
            {business.primary_category.name}
          </Link>
          <div className="absolute top-3 left-3">
            <OpenStatus hours={business.hours} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 font-heading text-lg">
          {business.title}
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
                className={`w-4 h-4 ${
                  i < Math.floor(business.total_score)
                    ? "text-yellow-400"
                    : "text-gray-300"
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
            className="text-sm text-gray-600 font-bold"
            aria-label={`Rating: ${business.total_score} out of 5`}
          >
            {business.total_score}
          </span>
          <span
            className="text-sm text-gray-500"
            aria-label={`${business.reviews_count.toLocaleString()} reviews`}
          >
            ({business.reviews_count.toLocaleString()})
          </span>
        </div>

        <Link
          href={`/state/${business.state.code}/city/${business.city.slug}`}
          className="text-sm text-gray-600 hover:text-blue-500"
          prefetch={false}
          aria-label={`View businesses in ${business.city.name}, ${business.state.name}`}
        >
          {business.address}
        </Link>
      </div>
    </article>
  );
}

export default BusinessCard;
