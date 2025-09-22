import React from "react";
import Link from "next/link";

// Data
import STATES from "@/lib/data/states";

function StatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-slate-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white mb-4">
              Find Radiator Repair Services by State
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Browse radiator repair shops and services available in each state.
              Click on any state to find certified repair specialists near you.
            </p>
          </div>
        </div>
      </div>

      {/* States Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {STATES.map((state) => (
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
      </div>
    </div>
  );
}

export default StatesPage;
