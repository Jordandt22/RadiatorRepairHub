import React from "react";
import Image from "next/image";
import Link from "next/link";

function FeaturedListings({ featuredListings }) {
  return (
    <section className="pt-24 pb-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
            Featured Radiator Repair Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
            Discover top-rated radiator repair shops in your area with verified
            reviews and ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {featuredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/business/${listing.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 overflow-hidden hover:scale-105  duration-200"
            >
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={listing.image_url}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 font-heading">
                  {listing.title}
                </h3>
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={listing.title + "-" + i}
                        className={`w-4 h-4 ${
                          i < Math.floor(listing.total_score)
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
                    {listing.total_score}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({listing.reviews_count.toLocaleString()})
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {listing.city.name}, {listing.state.name}{" "}
                  {listing.postal_code.code}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedListings;
