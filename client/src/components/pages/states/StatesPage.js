"use client";

import React, { useState, useMemo } from "react";
import StatesGrid from "./StatesGrid";
import STATES from "@/lib/data/states";

function StatesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStates = useMemo(() => {
    if (!searchTerm.trim()) {
      return STATES;
    }

    return STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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

      <StatesGrid
        states={filteredStates}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalStates={STATES.length}
        filteredCount={filteredStates.length}
      />
    </div>
  );
}

export default StatesPage;
