"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function Filters({ stateData, cityData }) {
  const {
    showFilters,
    setShowFilters,
    updateSortOption,
    filters,
    appliedFilters,
  } = useFilters();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative bg-card border border-border rounded-lg cursor-pointer">
        <select
          value={appliedFilters?.sort_option}
          onChange={(e) => {
            setShowFilters(false);
            updateSortOption(
              stateData,
              cityData,
              filters,
              Number(e.target.value)
            );
          }}
          className="px-4 py-3 pr-10 w-full text-foreground cursor-pointer appearance-none focus:border-ring outline-none duration-200"
        >
          <option value={1}>Most Reviews</option>
          <option value={2}>Least Reviews</option>
          <option value={3}>Highest Rating</option>
          <option value={4}>Lowest Rating</option>
        </select>
        {/* Custom Chevron Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-muted-foreground"
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
        </div>
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`px-4 py-3 border rounded-lg font-medium transition-colors duration-200 flex justify-between items-center gap-2 ${
          showFilters
            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 cursor-pointer"
            : "bg-card text-foreground border-border hover:bg-muted cursor-pointer"
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
            className="w-4 h-4 transition-transform duration-200 rotate-180 text-primary-foreground/70"
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
            className="w-4 h-4 transition-transform duration-200 text-muted-foreground"
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
