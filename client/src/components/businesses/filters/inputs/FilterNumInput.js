import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterNumInput({ label, name, min, max, step }) {
  const { filters, updateFilter } = useFilters();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({min} - {max})
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={filters[name]}
        onChange={(e) => {
          if (e.target.value === "") {
            updateFilter(name, e.target.value);
            return;
          }

          const val = Math.floor(Number(e.target.value));
          if (val < min) {
            updateFilter(name, min);
          } else if (val > max) {
            updateFilter(name, max);
          } else {
            updateFilter(name, String(val));
          }
        }}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-md cursor-pointer bg-white focus:border-blue-500 outline-none duration-200"
      />
    </div>
  );
}

export default FilterNumInput;
