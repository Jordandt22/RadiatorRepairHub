"use client";

import { useEffect, useRef, useState } from "react";

import AnimatedBusinessGrid from "@/components/businesses/cards/AnimatedBusinessGrid";
import BusinessCount from "@/components/content/BusinessCount";
import FeaturedSearch from "./FeaturedSearch";
import FeaturedSort from "./FeaturedSort";
import FeaturedPagination from "./FeaturedPagination";
import { FEATURED_PAGE_SIZE } from "./featuredUrl";

function FeaturedGrid({
  businesses,
  searchTerm,
  onSearchChange,
  sort,
  onSortChange,
  totalBusinesses,
  currentPage,
  totalPages,
  showPlaceholders,
}) {
  const isFirstRender = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const placeholderCount =
    showPlaceholders && businesses.length < FEATURED_PAGE_SIZE
      ? FEATURED_PAGE_SIZE - businesses.length
      : 0;
  const hasResults = businesses.length > 0 || placeholderCount > 0;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setRefreshKey((key) => key + 1);
  }, [searchTerm, sort, currentPage]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-6 text-sm text-muted-foreground">
        <BusinessCount count={totalBusinesses} />
        {searchTerm?.trim() && totalBusinesses
          ? " matching your search"
          : null}
      </p>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <FeaturedSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <FeaturedSort sort={sort} onSortChange={onSortChange} />
      </div>

      {!hasResults ? (
        <div className="mt-16 text-center">
          <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">
            No Businesses Found
          </h2>
          <p className="text-muted-foreground">
            No featured businesses match your search. Try a different name,
            location, or category.
          </p>
        </div>
      ) : (
        <>
          <AnimatedBusinessGrid
            businesses={businesses}
            placeholderCount={placeholderCount}
            refreshKey={refreshKey}
            trigger="mount"
          />
          <FeaturedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalBusinesses={totalBusinesses}
            pageSize={FEATURED_PAGE_SIZE}
            sort={sort}
            q={searchTerm}
          />
        </>
      )}
    </div>
  );
}

export default FeaturedGrid;
