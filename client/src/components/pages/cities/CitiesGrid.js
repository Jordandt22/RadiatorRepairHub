import React from "react";
import Link from "next/link";
import CitySearch from "./CitySearch";

function CitiesGrid({ cities, stateData, searchTerm, onSearchChange }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
          Cities in {stateData.name}
        </h2>
        <p className="text-gray-600">
          Browse through {cities.length} different cities
        </p>
      </div>

      <CitySearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      {!cities || cities.length === 0 ? (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Cities Found
          </h2>
          <p className="text-gray-600">
            No cities match your search criteria. Try adjusting your search
            term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/state/${stateData.code}/city/${city.slug}`}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-200 hover:border-blue-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                  {city.name}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {stateData.code}
                </div>
                <div className="mt-3 text-xs text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                  View Services →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CitiesGrid;
