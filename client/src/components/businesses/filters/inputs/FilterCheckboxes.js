"use client";

import React, { useState } from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterCheckboxes({ label, options, name, valueKey, labelKey }) {
  const { filters, handleArrayFilter } = useFilters();
  const defaultLimit = 10;
  const [limit, setLimit] = useState(defaultLimit);

  return (
    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 rounded-lg bg-muted p-4">
      <div className="flex justify-between items-center mb-4">
        <legend className="block text-sm font-medium text-foreground">
          {label}
        </legend>
        {options.length > defaultLimit && (
          <>
            {limit < options.length ? (
              <button
                className="text-sm text-muted-foreground cursor-pointer hover:text-interactive duration-300"
                onClick={() => setLimit(options.length)}
                aria-label={`Show all ${label.toLowerCase()}`}
              >
                Show All
              </button>
            ) : (
              <button
                className="text-sm text-muted-foreground cursor-pointer hover:text-interactive duration-300"
                onClick={() => setLimit(defaultLimit)}
                aria-label={`Show fewer ${label.toLowerCase()}`}
              >
                Show Less
              </button>
            )}
          </>
        )}
      </div>

      <fieldset className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <legend className="sr-only">{label}</legend>
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
              className="rounded border-border text-primary focus:ring-ring"
              aria-describedby={`${name}-${option[valueKey]}-description`}
            />
            <span
              id={`${name}-${option[valueKey]}-description`}
              className="ml-2 text-sm text-foreground capitalize"
            >
              {option[labelKey]}
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export default FilterCheckboxes;
