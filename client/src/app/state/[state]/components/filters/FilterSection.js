"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import MobileFilterSection from "./MobileFilterSection";
import FilterDropdown from "./FilterDropdown";
import FilterNumInput from "./FilterNumInput";
import FilterCheckboxes from "./FilterCheckboxes";

function FilterSection() {
  const { showFilters, filters, clearAllFilters, updateFilter } = useFilters();

  // Placeholder data
  const cities = [
    "Los Angeles",
    "San Francisco",
    "San Diego",
    "Sacramento",
    "Fresno",
    "Houston",
    "Dallas",
    "Austin",
    "San Antonio",
    "Fort Worth",
    "Miami",
    "Tampa",
    "Orlando",
    "Jacksonville",
    "Tallahassee",
    "New York City",
    "Buffalo",
    "Rochester",
    "Syracuse",
    "Albany",
  ];

  const primaryCategories = [
    "Auto Repair",
    "Radiator Repair",
    "Engine Repair",
    "Transmission Repair",
    "Brake Service",
    "Oil Change",
    "Tire Service",
    "AC Repair",
  ];

  const secondaryCategories = [
    "Emergency Service",
    "Mobile Service",
    "Towing",
    "Diagnostics",
    "Maintenance",
    "Warranty Service",
    "Fleet Service",
    "Commercial",
  ];

  const features = [
    "Appointments Recommended",
    "Credit Cards",
    "Debit Cards",
    "Mechanic",
    "Oil Change",
    "NFC Mobile Payments",
    "Onsite Services",
    "Restroom",
    "Wheelchair Accessible",
  ];

  return (
    <>
      {/* Desktop Filter Section */}
      <div
        className={`hidden md:block overflow-hidden transition-all duration-300 ${
          showFilters ? "mt-8 max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="w-full">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* City Filter */}
              <FilterDropdown options={cities} label="City" name="city" />

              {/* Min Total Score */}
              <FilterNumInput
                label="Min Total Score"
                name="minTotalScore"
                min={3.0}
                max={5.0}
                step={0.1}
              />

              {/* Min Reviews */}
              <FilterNumInput
                label="Min Reviews"
                name="minReviews"
                min={1}
                max={500}
                step={1}
              />

              {/* Primary Category */}
              <FilterDropdown
                options={primaryCategories}
                label="Primary Category"
                name="primaryCategory"
              />

              {/* Secondary Categories */}
              <FilterCheckboxes
                options={secondaryCategories}
                label="Secondary Categories"
                name="secondaryCategories"
              />

              {/* Features */}
              <FilterCheckboxes
                options={features}
                label="Features"
                name="features"
              />

              {/* Open Hours */}
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-slate-100 p-4 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Hours
                </label>
                <div className="flex gap-6">
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

            {/* Clear All Filters Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
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
          cities={cities}
          primaryCategories={primaryCategories}
          secondaryCategories={secondaryCategories}
          features={features}
        />
      )}
    </>
  );
}

export default FilterSection;
