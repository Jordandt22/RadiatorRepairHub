import React from "react";

// Contexts
import { useFilters } from "../FilterProvider";

function FilterCheckboxes({ label, options, name }) {
  const { filters, handleArrayFilter } = useFilters();

  return (
    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-slate-100 p-4 rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center">
            <input
              type="checkbox"
              checked={filters[name].includes(option)}
              onChange={(e) =>
                handleArrayFilter(name, option, e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default FilterCheckboxes;
