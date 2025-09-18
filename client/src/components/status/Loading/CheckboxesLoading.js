import React from "react";

function CheckboxesLoading({ label }) {
  return (
    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-slate-100 p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CheckboxesLoading;
