"use client";

import React, { useState, useMemo } from "react";

// Data
import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";

// Components
import CategoriesGrid from "./CategoriesGrid";
import PageHeader from "@/components/layout/Header/PageHeader";

function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return PRIMARY_CATEGORIES;
    }

    return PRIMARY_CATEGORIES.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
        totalCategories={PRIMARY_CATEGORIES.length}
        filteredCount={filteredCategories.length}
      />
    </div>
  );
}

export default CategoriesPage;
