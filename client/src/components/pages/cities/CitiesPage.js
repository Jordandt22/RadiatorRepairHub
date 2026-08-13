"use client";

import React, { useState, useMemo } from "react";
import CitiesGrid from "./CitiesGrid";
import PageHeader from "@/components/layout/Header/PageHeader";

function CitiesPage({ stateData, stateCities }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("alpha");

  const filteredCities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const matched = query
      ? stateCities.filter((city) => city.name.toLowerCase().includes(query))
      : [...stateCities];

    return matched.sort((a, b) => {
      if (sort === "most" || sort === "least") {
        const diff =
          (Number(b.business_count) || 0) - (Number(a.business_count) || 0);
        if (diff !== 0) {
          return sort === "most" ? diff : -diff;
        }
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchTerm, sort, stateCities]);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "States", url: "/states" },
    { name: stateData.name, url: `/state/${stateData.code}` },
    { name: "Cities", url: `/states/${stateData.code}/cities` },
  ];

  const pageTitle = `Radiator Repair Services in ${stateData.name} Cities`;
  const pageDescription = `Browse radiator repair shops and services available in cities throughout ${stateData.name}. Click on any city to find certified repair specialists near you.`;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        headerLink={{
          label: "View States",
          href: "/states",
        }}
      />

      <CitiesGrid
        cities={filteredCities}
        stateData={stateData}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sort={sort}
        onSortChange={setSort}
        totalCities={stateCities.length}
        filteredCount={filteredCities.length}
      />
    </div>
  );
}

export default CitiesPage;
