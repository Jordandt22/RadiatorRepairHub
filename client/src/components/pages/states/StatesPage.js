"use client";

import React, { useState, useMemo } from "react";
import StatesGrid from "./StatesGrid";
import STATES from "@/lib/data/states";
import PageHeader from "@/components/layout/Header/PageHeader";

function StatesPage({ statesWithCounts = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("alpha");

  const catalog = useMemo(() => {
    if (statesWithCounts.length > 0) return statesWithCounts;

    return STATES.map((state) => ({
      ...state,
      business_count: 0,
    }));
  }, [statesWithCounts]);

  const filteredStates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const matched = query
      ? catalog.filter(
          (state) =>
            state.name.toLowerCase().includes(query) ||
            state.code.toLowerCase().includes(query)
        )
      : [...catalog];

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
  }, [searchTerm, sort, catalog]);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "States", url: "/states" },
  ];

  const pageTitle = "Find Radiator Repair Services by State";
  const pageDescription =
    "Browse radiator repair shops and services available in each state. Click on any state to find certified repair specialists near you.";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        headerLink={{
          label: "Search",
          href: "/search?page=1&sort=verified",
        }}
      />

      <StatesGrid
        states={filteredStates}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sort={sort}
        onSortChange={setSort}
        totalStates={catalog.length}
        filteredCount={filteredStates.length}
      />
    </div>
  );
}

export default StatesPage;
