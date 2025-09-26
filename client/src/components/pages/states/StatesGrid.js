import React from "react";
import Link from "next/link";
import StateSearch from "./StateSearch";

function StatesGrid({ states, searchTerm, onSearchChange }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
          All States
        </h2>
        <p className="text-gray-600">
          Browse through {states.length} different states
        </p>
      </div>

      <StateSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      {!states || states.length === 0 ? (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No States Found
          </h2>
          <p className="text-gray-600">
            No states match your search criteria. Try adjusting your search
            term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {states.map((state) => (
            <div
              key={state.id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {state.name}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {state.code}
                </div>
                <div className="flex flex-col mt-3 gap-4">
                  <Link
                    href={`/state/${state.code}`}
                    className="text-sm font-medium text-gray-400 hover:text-blue-500"
                  >
                    View Services →
                  </Link>
                  <Link
                    href={`/states/${state.code}/cities`}
                    className="text-xs px-4 py-2 bg-white border-1 border-gray-200 text-gray-900 rounded-md font-medium hover:bg-blue-500 hover:text-white duration-200"
                  >
                    View Cities
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatesGrid;
