"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import MobileFilterSection from "./MobileFilterSection";
import FilterNumInput from "./inputs/FilterNumInput";
import FilterSliderInput from "./inputs/FilterSliderInput";
import CitiesDropdown from "./dropdowns/CitiesDropdown";
import PrimaryCategoriesDropdown from "./dropdowns/PrimaryCategoriesDropdown";
import FeaturesCheckboxes from "./checkboxes/FeaturesCheckboxes";
import SecondaryCategoriesCheckboxes from "./checkboxes/SecondaryCategoriesCheckboxes";
import StatesDropdown from "./dropdowns/StatesDropdown";

function FilterSection({ stateData, cityData, page }) {
  const {
    showFilters,
    filters,
    clearAllFilters,
    updateOpenFilter,
    applyFilters,
  } = useFilters();

  return (
    <>
      {/* Desktop Filter Section */}
      <div
        className={`hidden md:block overflow-hidden transition-all duration-300 ${
          showFilters ? "mt-8 max-h-fit opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="w-full">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {!stateData && !cityData && <StatesDropdown />}

              {/* City Filter */}
              {!cityData && <CitiesDropdown stateData={stateData} />}

              {/* Primary Category */}
              <PrimaryCategoriesDropdown />

              {/* Min Total Score */}
              <div className="flex gap-12 items-center md:col-span-2 lg:col-span-3 xl:col-span-4 bg-slate-100 p-4 rounded-md">
                <div className="w-1/3">
                  <FilterSliderInput
                    label="Min. Total Score"
                    name="total_score"
                    min={1.0}
                    max={5.0}
                    step={0.1}
                  />
                </div>

                {/* Min Reviews */}
                <div className="w-1/3">
                  <FilterNumInput
                    label="Min. Reviews"
                    name="reviews_count"
                    min={1}
                    max={500}
                    step={1}
                  />
                </div>
              </div>

              {/* Secondary Categories */}
              <SecondaryCategoriesCheckboxes />

              {/* Features */}
              <FeaturesCheckboxes />

              {/* Open Hours */}
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-slate-100 p-4 rounded-md">
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

            {/* Clear All Filters Button */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => applyFilters(filters, stateData, cityData, page)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-gray-300 rounded-md hover:bg-blue-800 cursor-pointer transition-all duration-300"
              >
                Apply Filters
              </button>
              <button
                onClick={() => clearAllFilters(stateData, cityData)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer transition-all duration-300"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Popup */}
      {showFilters && (
        <MobileFilterSection
          stateData={stateData}
          cityData={cityData}
          page={page}
        />
      )}
    </>
  );
}

export default FilterSection;
