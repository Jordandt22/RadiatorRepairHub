import React from "react";
import { MapPin, Star, Phone } from "lucide-react";
import Link from "next/link";

async function FeaturedBusinesses() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URI}/businesses/featured`
  );
  const data = await res.json();
  const businesses = data.data;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            Featured Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Top-rated radiator repair shops recommended by our community
          </p>
        </div>

        {data?.data && businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.slice(0, 3).map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-3"
              >
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

                      {business.secondary_categories
                        .slice(0, 2)
                        .map((category) => (
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
            ))}
          </div>
        ) : (
          <div className="text-center mt-12">
            <p className="text-gray-600">No Featured Businesses Found</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/featured"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 duration-300 hover:scale-105 block w-fit mx-auto"
          >
            View All Featured Businesses
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedBusinesses;
