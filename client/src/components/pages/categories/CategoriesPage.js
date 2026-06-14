"use client";

import React, { useState, useMemo } from "react";

// Components
import CategoriesGrid from "./CategoriesGrid";
import PageHeader from "@/components/layout/Header/PageHeader";

function CategoriesPage({ primaryCategories = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return primaryCategories;
    }

    return primaryCategories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, primaryCategories]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
        ]}
        pageTitle="Service Categories"
        pageDescription="Explore all the automotive service categories available. Find specialized repair shops and services for your specific vehicle needs."
      />
      <CategoriesGrid
        categories={filteredCategories}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCategories={primaryCategories.length}
        filteredCount={filteredCategories.length}
      />
    </div>
  );
}

export default CategoriesPage;
