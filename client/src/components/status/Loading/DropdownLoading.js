import React from "react";

function DropdownLoading({ label }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="flex justify-center items-center bg-muted h-10 rounded-md animate-pulse text-foreground">
        Loading...
      </div>
    </div>
  );
}

export default DropdownLoading;
