import React from "react";
import DetailedBusinessCard from "@/components/businesses/cards/DetailedBusinessCard";

function FeaturedGrid({ businesses }) {
  if (!businesses || businesses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Featured Businesses Found
          </h2>
          <p className="text-gray-600">
            We&apos;re currently updating our featured businesses list. Please
            check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
          Top-Rated Radiator Repair Specialists
        </h2>
        <p className="text-gray-600">
          Showing {businesses.length} featured businesses with exceptional
          ratings and reviews
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <DetailedBusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
}

export default FeaturedGrid;
