import React from "react";
import { Search, X } from "lucide-react";

function StateSearch({ searchTerm, onSearchChange }) {
  return (
    <div className="mb-8">
      <div className="max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search states..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400  focus:border-blue-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-red-400 duration-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StateSearch;
