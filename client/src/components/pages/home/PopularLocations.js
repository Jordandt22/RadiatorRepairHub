import React from "react";
import { MapPin } from "lucide-react";
import Link from "next/link";

function PopularLocations() {
  const topCities = [
    { name: "Houston", state: "TX", slug: "houston" },
    { name: "Los Angeles", state: "CA", slug: "los-angeles" },
    { name: "Chicago", state: "IL", slug: "chicago" },
    { name: "Phoenix", state: "AZ", slug: "phoenix" },
    { name: "Philadelphia", state: "PA", slug: "philadelphia" },
    { name: "New York City", state: "NY", slug: "new-york-city" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            Popular Locations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find radiator repair shops in the most searched cities across the
            United States
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topCities.map((city, index) => (
            <Link
              key={city.slug}
              href={`/state/${city.state}/city/${city.slug}`}
              className="bg-gray-50 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 hover:-translate-y-1 animate-fade-in-up hover:bg-blue-50 hover:border-blue-500 border-2 border-transparent"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-heading">
                {city.name}
              </h3>
              <p className="text-gray-600 mb-4">{city.state}</p>
              <span className="text-blue-600 font-medium group-hover:text-blue-700">
                View Shops →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularLocations;
