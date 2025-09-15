import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterDropdown({ options, label, name }) {
  const { filters, updateFilter } = useFilters();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={filters[name]}
        onChange={(e) => updateFilter(name, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
      >
        <option value="">All {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterDropdown;
