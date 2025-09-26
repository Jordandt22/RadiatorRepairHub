"use client";

import React, { useState, useMemo } from "react";
import CitiesGrid from "./CitiesGrid";

function CitiesPage({ stateData, stateCities }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) {
      return stateCities;
    }

    return stateCities.filter((city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, stateCities]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-slate-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white mb-4">
              Radiator Repair Services in {stateData.name} Cities
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Browse radiator repair shops and services available in cities
              throughout {stateData.name}. Click on any city to find certified
              repair specialists near you.
            </p>
          </div>
        </div>
      </div>

      <CitiesGrid
        cities={filteredCities}
        stateData={stateData}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCities={stateCities.length}
        filteredCount={filteredCities.length}
      />
    </div>
  );
}

export default CitiesPage;
