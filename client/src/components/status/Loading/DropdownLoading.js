import React from "react";

function DropdownLoading({ label }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex justify-center items-center bg-gray-200 h-10 rounded-md animate-pulse text-gray-700">
        Loading...
      </div>
    </div>
  );
}

export default DropdownLoading;
