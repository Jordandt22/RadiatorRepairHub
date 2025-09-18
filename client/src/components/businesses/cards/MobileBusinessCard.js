import React from "react";
import Link from "next/link";
import Image from "next/image";

function MobileBusinessCard({ business }) {
  return (
    <Link href={`/business/${business.id}`} className="md:hidden block h-full">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-full">
        <div className="relative w-full h-56 bg-gray-200">
          {business.image_url ? (
            <Image
              src={business.image_url}
              alt={business.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={business.image_url}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-sm text-gray-500">No image available</p>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 font-heading text-lg">
            {business.title}
          </h3>

          <div className="flex items-center mb-1">
            <div className="flex items-center">
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
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 font-bold">
              {business.total_score}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              ({business.reviews_count.toLocaleString()})
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{business.address}</p>

          <p className="w-fit text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md  capitalize">
            {business.primary_category.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default MobileBusinessCard;
