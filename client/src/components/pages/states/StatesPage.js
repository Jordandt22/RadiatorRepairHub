"use client";

import React, { useState, useMemo } from "react";
import StatesGrid from "./StatesGrid";
import STATES from "@/lib/data/states";
import PageHeader from "@/components/layout/Header/PageHeader";

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

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "States", url: "/states" },
  ];

  const pageTitle = "Find Radiator Repair Services by State";
  const pageDescription =
    "Browse radiator repair shops and services available in each state. Click on any state to find certified repair specialists near you.";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
      />

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
