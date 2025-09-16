import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterSliderInput({ label, name, min, max, step }) {
  const { filters, updateFilter } = useFilters();

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    updateFilter(name, value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}: {filters[name]}
      </label>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={filters[name]}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((filters[name] - min) / (max - min)) * 100
            }%, #e5e7eb ${
              ((filters[name] - min) / (max - min)) * 100
            }%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default FilterSliderInput;
