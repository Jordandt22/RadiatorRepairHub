"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function Filters({ stateData, cityData, sort }) {
  const router = useRouter();
  const {
    showFilters,
    setShowFilters,
    updateSortOption,
    appliedFilters,
    getSortOption,
  } = useFilters();

  useEffect(() => {
    updateSortOption(sort);
  }, [sort]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <select
        value={appliedFilters.sort_option}
        onChange={(e) => {
          router.push(
            `/state/${stateData.code}${
              cityData ? `/city/${cityData.slug}` : ""
            }?page=1&sort=${getSortOption(e.target.value)}`
          );
          updateSortOption(e.target.value);
        }}
        className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 cursor-pointer"
      >
        <option value={1}>Most Reviews</option>
        <option value={2}>Least Reviews</option>
        <option value={3}>Highest Rating</option>
        <option value={4}>Lowest Rating</option>
      </select>

      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`px-4 py-3 border rounded-lg font-medium transition-colors duration-200 flex justify-between items-center gap-2 ${
          showFilters
            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 cursor-pointer"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </span>

        {showFilters && (
          <svg
            className="w-4 h-4 transition-transform duration-200 rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
        {!showFilters && (
          <svg
            className="w-4 h-4 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default Filters;
