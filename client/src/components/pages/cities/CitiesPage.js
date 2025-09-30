"use client";

import React, { useState, useMemo } from "react";
import CitiesGrid from "./CitiesGrid";
import PageHeader from "@/components/layout/Header/PageHeader";

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

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "States", url: "/states" },
    { name: stateData.name, url: `/state/${stateData.code}` },
    { name: "Cities", url: `/state/${stateData.code}/cities` },
  ];

  const pageTitle = `Radiator Repair Services in ${stateData.name} Cities`;
  const pageDescription = `Browse radiator repair shops and services available in cities throughout ${stateData.name}. Click on any city to find certified repair specialists near you.`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
      />

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
