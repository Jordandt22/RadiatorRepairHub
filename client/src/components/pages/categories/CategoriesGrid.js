import React from "react";
import CategoryCard from "./CategoryCard";
import CategorySearch from "./CategorySearch";

function CategoriesGrid({ categories, searchTerm, onSearchChange }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
          All Service Categories
        </h2>
        <p className="text-gray-600">
          Browse through {categories.length} different automotive service
          categories
        </p>
      </div>

      <CategorySearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      {!categories || categories.length === 0 ? (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Categories Found
          </h2>
          <p className="text-gray-600">
            We&apos;re currently updating our service categories. Please check
            back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriesGrid;
