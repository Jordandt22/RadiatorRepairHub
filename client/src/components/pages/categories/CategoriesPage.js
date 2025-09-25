"use client";

import React, { useState, useMemo } from "react";
import Header from "./Header";
import CategoriesGrid from "./CategoriesGrid";
import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";

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
      <Header />
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
