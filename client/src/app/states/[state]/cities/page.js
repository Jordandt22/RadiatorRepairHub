import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Data
import STATES from "@/lib/data/states";
import CITIES from "@/lib/data/cities";

async function CitiesPage({ params }) {
  const { state } = await params;

  // Find the state data
  const stateData = STATES.find((s) => s.code === state);
  if (!stateData) {
    return notFound();
  }

  // Filter cities by state
  const stateCities = CITIES.filter((city) => city.state_id === stateData.id);

  // Sort cities alphabetically
  stateCities.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-slate-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white mb-4">
              Radiator Repair Services in {stateData.name} Cities
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Browse radiator repair shops and services available in cities
              throughout {stateData.name}. Click on any city to find certified
              repair specialists near you.
            </p>
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {stateCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {stateCities.map((city) => (
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
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No cities found for {stateData.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CitiesPage;
