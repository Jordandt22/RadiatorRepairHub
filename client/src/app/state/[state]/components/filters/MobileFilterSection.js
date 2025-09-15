import React from "react";

// Contexts
import { useFilters } from "../FilterProvider";

function MobileFilterSection({
  cities,
  primaryCategories,
  secondaryCategories,
  features,
}) {
  const {
    filters,
    updateFilter,
    handleArrayFilter,
    clearAllFilters,
    setShowFilters,
  } = useFilters();

  return (
    <div className="md:hidden fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setShowFilters(false)}
      />

      {/* Popup */}
      <div className="relative bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setShowFilters(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Min Total Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Total Score
            </label>
            <input
              type="number"
              min="3"
              max="5"
              step="0.1"
              value={filters.minTotalScore}
              onChange={(e) =>
                updateFilter("minTotalScore", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Min Reviews */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Reviews
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={filters.minReviews}
              onChange={(e) =>
                updateFilter("minReviews", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Primary Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Category
            </label>
            <select
              value={filters.primaryCategory}
              onChange={(e) => updateFilter("primaryCategory", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {primaryCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Categories
            </label>
            <div className="space-y-2">
              {secondaryCategories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.secondaryCategories.includes(category)}
                    onChange={(e) =>
                      handleArrayFilter(
                        "secondaryCategories",
                        category,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="space-y-2">
              {features.map((feature) => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.features.includes(feature)}
                    onChange={(e) =>
                      handleArrayFilter("features", feature, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Open Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Open Hours
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.openWeekdays}
                  onChange={(e) =>
                    updateFilter("openWeekdays", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Weekdays</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.openWeekends}
                  onChange={(e) =>
                    updateFilter("openWeekends", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Weekends</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer with Clear Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileFilterSection;
