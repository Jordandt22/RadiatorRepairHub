"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";
import { useToast } from "@/contexts/ToastProvider";

function SearchBar({ stateData, cityData, page }) {
  const { updateFilter, applyFilters, filters, appliedFilters } = useFilters();
  const { showCustomError } = useToast();

  const handleSearch = () => {
    // Check Max Length
    if (filters.title.length > 150) {
      return showCustomError(
        "Please keep your business name under 150 characters..",
        "Search Input Too Long"
      );
    }

    // Check for Special Characters (Allowed: ', -, &, _)
    const specialCharacters = new RegExp(
      /[!@#$%^*()+\=\[\]{};:"\\|,.<>\/?]/,
      "gi"
    );
    if (specialCharacters.test(filters.title)) {
      return showCustomError(
        "Allowed: ', -, &, _",
        "Invalid Special Characters"
      );
    }

    applyFilters(filters, appliedFilters, stateData, cityData, page);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearInput = () => {
    updateFilter("title", "");
  };

  return (
    <div className="flex-1">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter business name…"
            value={filters.title}
            onChange={(e) => updateFilter("title", e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-4 py-3 pl-10 pr-10 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none duration-200 transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Clear Icon */}
          {filters.title && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={handleClearInput}
                className="w-5 h-5 text-gray-400 hover:scale-125 hover:text-red-400 duration-200 cursor-pointer"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
