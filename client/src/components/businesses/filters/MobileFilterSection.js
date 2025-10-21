"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import FilterNumInput from "./inputs/FilterNumInput";
import FilterSliderInput from "./inputs/FilterSliderInput";
import CitySearch from "./comboboxes/CitySearch";
import StateSearch from "./comboboxes/StateSearch";
import PostalCodeSearch from "./comboboxes/PostalCodeSearch";
import PrimaryCategoriesDropdown from "./dropdowns/PrimaryCategoriesDropdown";
import FeaturesCheckboxes from "./checkboxes/FeaturesCheckboxes";
import SecondaryCategoriesCheckboxes from "./checkboxes/SecondaryCategoriesCheckboxes";

function MobileFilterSection({ stateData, cityData, page }) {
  const {
    filters,
    updateOpenFilter,
    clearAllFilters,
    applyFilters,
    setShowFilters,
    appliedFilters,
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-60">
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
          {!stateData && !cityData && <StateSearch />}

          {/* City Filter */}
          {!cityData && <CitySearch stateData={stateData} />}

          {/* Postal Code */}
          <PostalCodeSearch stateData={stateData} />

          {/* Min Total Score */}
          <FilterSliderInput
            label="Min. Total Score"
            name="total_score"
            min={1.0}
            max={5.0}
            step={0.1}
          />

          {/* Min Reviews */}
          <FilterNumInput
            label="Min. Reviews"
            name="reviews_count"
            min={1}
            max={500}
            step={1}
          />

          {/* Primary Category */}
          <PrimaryCategoriesDropdown />

          {/* Secondary Categories */}
          <SecondaryCategoriesCheckboxes />

          {/* Features */}
          <FeaturesCheckboxes />

          {/* Open Hours */}
          <div className="bg-slate-100 p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Open Hours
            </label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.open.weekdays}
                  onChange={(e) =>
                    updateOpenFilter("weekdays", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Weekdays</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.open.weekends}
                  onChange={(e) =>
                    updateOpenFilter("weekends", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Weekends</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer with Apply and Clear Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                applyFilters(
                  filters,
                  appliedFilters,
                  stateData,
                  cityData,
                  page
                );
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-gray-300 rounded-md hover:bg-blue-800 cursor-pointer transition-all duration-300"
            >
              Apply Filters
            </button>
            <button
              onClick={() =>
                clearAllFilters(stateData, cityData, appliedFilters)
              }
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer transition-all duration-300"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileFilterSection;
