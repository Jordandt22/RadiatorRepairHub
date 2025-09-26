import React from "react";
import DetailedBusinessCard from "@/components/businesses/cards/DetailedBusinessCard";

function BusinessesGrid({ businesses, categoryName }) {
  if (!businesses || businesses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Businesses Found
          </h2>
          <p className="text-gray-600">
            We couldn&apos;t find any businesses in this category. Please try a
            different category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
          Available Businesses
        </h2>
        <p className="text-gray-600">
          Showing {businesses.length} businesses for the{" "}
          <span className="capitalize text-blue-600 font-medium">
            {categoryName}
          </span>{" "}
          category
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

export default BusinessesGrid;
