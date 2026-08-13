import React from "react";
import { Search, X } from "lucide-react";

function CitySearch({ searchTerm, onSearchChange }) {
  return (
    <div className="mb-8">
      <div className="max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-border rounded-lg leading-5 bg-card placeholder-muted-foreground focus:outline-none focus:border-ring text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-destructive duration-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CitySearch;
