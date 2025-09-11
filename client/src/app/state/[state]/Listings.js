import React from "react";
import Link from "next/link";
import Image from "next/image";

function Listings({ businesses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {businesses.map((business) => (
        <Link
          key={business.id}
          href={`/business/${business.id}`}
          className="bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 overflow-hidden hover:scale-105 transition-transform duration-200"
        >
          <div className="relative w-full h-56 bg-gray-200">
            <Image
              src={business.image_url}
              alt={business.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />
          </div>

          <div className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 font-heading text-lg">
              {business.title}
            </h3>

            <div className="flex items-center mb-3">
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

            <p className="text-sm text-gray-600 mb-1">{business.address}</p>
            <p className="text-sm text-gray-600">
              {business.city.name}, {business.state.name}{" "}
              {business.postal_code.code}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Listings;
