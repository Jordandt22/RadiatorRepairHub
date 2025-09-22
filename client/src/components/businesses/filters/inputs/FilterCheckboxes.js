"use client";

import React, { useState } from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterCheckboxes({ label, options, name, valueKey, labelKey }) {
  const { filters, handleArrayFilter } = useFilters();
  const defaultLimit = 10;
  const [limit, setLimit] = useState(defaultLimit);

  return (
    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-slate-100 p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {options.length > defaultLimit && (
          <>
            {limit < options.length ? (
              <button
                className="text-sm text-gray-500 cursor-pointer hover:text-blue-600 duration-300"
                onClick={() => setLimit(options.length)}
              >
                Show All
              </button>
            ) : (
              <button
                className="text-sm text-gray-500 cursor-pointer hover:text-blue-600 duration-300"
                onClick={() => setLimit(defaultLimit)}
              >
                Show Less
              </button>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.slice(0, limit + 1).map((option) => (
          <label
            key={`checkboxes-${name}-` + option[labelKey]}
            className="flex items-center"
          >
            <input
              type="checkbox"
              checked={filters[name]?.includes(option[valueKey])}
              onChange={(e) =>
                handleArrayFilter(name, option[valueKey], e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 capitalize">
              {option[labelKey]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default FilterCheckboxes;
