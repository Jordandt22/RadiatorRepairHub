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

function MobileFilterSection({ stateData, cityData, categoryData, page }) {
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
      <div className="relative bg-card min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between z-60">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <button
            onClick={() => setShowFilters(false)}
            className="rounded-full p-2 hover:bg-muted"
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
          {!categoryData && <PrimaryCategoriesDropdown />}

          {/* Secondary Categories */}
          <SecondaryCategoriesCheckboxes />

          {/* Features */}
          <FeaturesCheckboxes />

          {/* Open Hours */}
          <div className="rounded-lg bg-muted p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
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
                  className="rounded border-border text-primary focus:ring-ring"
                />
                <span className="ml-2 text-sm text-foreground">Weekdays</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.open.weekends}
                  onChange={(e) =>
                    updateOpenFilter("weekends", e.target.checked)
                  }
                  className="rounded border-border text-primary focus:ring-ring"
                />
                <span className="ml-2 text-sm text-foreground">Weekends</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer with Apply and Clear Buttons */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                applyFilters(
                  filters,
                  appliedFilters,
                  stateData,
                  cityData,
                  page,
                  { categoryData }
                );
              }}
              className="flex-1 cursor-pointer rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              Apply Filters
            </button>
            <button
              onClick={() =>
                clearAllFilters(
                  stateData,
                  cityData,
                  appliedFilters,
                  categoryData
                )
              }
              className="flex-1 cursor-pointer rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted"
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
