import React from "react";

// Contexts
import { useFilters } from "../FilterProvider";

function FilterNumInput({ label, name, min, max, step }) {
  const { filters, updateFilter } = useFilters();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={filters[name]}
        onChange={(e) => updateFilter(name, parseFloat(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
      />
    </div>
  );
}

export default FilterNumInput;
