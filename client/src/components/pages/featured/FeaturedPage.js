"use client";

import React, { useMemo, useState } from "react";
import Header from "./Header";
import FeaturedGrid from "./FeaturedGrid";

function matchesSearch(business, query) {
  const haystack = [
    business.title,
    business.address,
    business.city?.name,
    business.state?.name,
    business.state?.code,
    business.primary_category?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function FeaturedPage({ businesses = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("featured");

  const orderIndex = useMemo(
    () => new Map(businesses.map((business, index) => [business.id, index])),
    [businesses]
  );

  const filteredBusinesses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const matched = query
      ? businesses.filter((business) => matchesSearch(business, query))
      : [...businesses];

    return matched.sort((a, b) => {
      if (sort === "featured") {
        return (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0);
      }

      if (sort === "alpha") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sort === "most_reviews" || sort === "least_reviews") {
        const diff =
          (Number(b.reviews_count) || 0) - (Number(a.reviews_count) || 0);
        if (diff !== 0) {
          return sort === "most_reviews" ? diff : -diff;
        }
      }

      if (sort === "highest_rating" || sort === "lowest_rating") {
        const diff =
          (Number(b.total_score) || 0) - (Number(a.total_score) || 0);
        if (diff !== 0) {
          return sort === "highest_rating" ? diff : -diff;
        }
      }

      return (a.title || "").localeCompare(b.title || "");
    });
  }, [searchTerm, sort, businesses, orderIndex]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <FeaturedGrid
        businesses={filteredBusinesses}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sort={sort}
        onSortChange={setSort}
        totalBusinesses={businesses.length}
        filteredCount={filteredBusinesses.length}
      />
    </div>
  );
}

export default FeaturedPage;
