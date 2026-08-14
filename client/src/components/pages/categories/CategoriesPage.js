"use client";

import React, { useState, useMemo } from "react";
import CategoriesGrid from "./CategoriesGrid";
import PageHeader from "@/components/layout/Header/PageHeader";

function CategoriesPage({ categoriesWithCounts = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("alpha");

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const matched = query
      ? categoriesWithCounts.filter((category) =>
          category.name.toLowerCase().includes(query)
        )
      : [...categoriesWithCounts];

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
  }, [searchTerm, sort, categoriesWithCounts]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
        ]}
        pageTitle="Service Categories"
        pageDescription="Explore all the automotive service categories available. Find specialized repair shops and services for your specific vehicle needs."
        headerLink={{
          label: "Search",
          href: "/search?page=1&sort=most_reviews",
        }}
      />
      <CategoriesGrid
        categories={filteredCategories}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sort={sort}
        onSortChange={setSort}
        totalCategories={categoriesWithCounts.length}
        filteredCount={filteredCategories.length}
      />
    </div>
  );
}

export default CategoriesPage;
