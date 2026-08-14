"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterNumInput({ label, name, min, max, step }) {
  const { filters, updateFilter } = useFilters();

  return (
    <div>
      <label
        htmlFor={`filter-${name}`}
        className="block text-sm font-medium text-foreground mb-2"
      >
        {label} ({min} - {max})
      </label>
      <input
        id={`filter-${name}`}
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
        className="w-full px-3 py-2 border border-border rounded-md cursor-pointer bg-card focus:border-ring outline-none duration-200"
        aria-label={`${label} between ${min} and ${max}`}
        aria-describedby={`${name}-range-description`}
      />
      <div id={`${name}-range-description`} className="sr-only">
        Enter a value between {min} and {max}
      </div>
    </div>
  );
}

export default FilterNumInput;
