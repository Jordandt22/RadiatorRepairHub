"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterDropdown({
  options,
  label,
  name,
  valueKey,
  labelKey,
  inputLabel,
}) {
  const { filters, updateFilter } = useFilters();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={filters[name]}
          onChange={(e) => updateFilter(name, e.target.value)}
          className="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-md cursor-pointer appearance-none focus:border-blue-500 outline-none duration-200"
        >
          <option value="">All {inputLabel}</option>
          {options.map((option) => {
            return (
              <option
                key={`dropdown-${name}-` + option[valueKey]}
                value={option[valueKey]}
                className="capitalize"
              >
                {option[labelKey]}
              </option>
            );
          })}
        </select>
        {/* Custom Chevron Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
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
    </div>
  );
}

export default FilterDropdown;
