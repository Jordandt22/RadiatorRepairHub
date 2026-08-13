import React from "react";
import DetailedBusinessCard from "@/components/businesses/cards/DetailedBusinessCard";
import FeaturedSearch from "./FeaturedSearch";
import FeaturedSort from "./FeaturedSort";

function FeaturedGrid({
  businesses,
  searchTerm,
  onSearchChange,
  sort,
  onSortChange,
  totalBusinesses,
  filteredCount,
}) {
  const hasCatalog = totalBusinesses > 0;

  if (!hasCatalog) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">
            No Featured Businesses Found
          </h2>
          <p className="text-muted-foreground">
            We&apos;re currently updating our featured businesses list. Please
            check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-6 text-sm text-muted-foreground">
        <span className="font-semibold text-green-700">
          {(filteredCount ?? businesses.length).toLocaleString()}
        </span>{" "}
        {(filteredCount ?? businesses.length) === 1 ? "Business" : "Businesses"}
        {searchTerm?.trim() && totalBusinesses
          ? ` of ${totalBusinesses.toLocaleString()}`
          : null}
      </p>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <FeaturedSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <FeaturedSort sort={sort} onSortChange={onSortChange} />
      </div>

      {!businesses || businesses.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <DetailedBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FeaturedGrid;
