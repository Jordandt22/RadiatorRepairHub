import React from "react";
import { notFound } from "next/navigation";

// Data
import states from "@/lib/data/states";
import cities from "@/lib/data/cities";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";
import { FilterProvider } from "@/contexts/FilterProvider";

// Components
import FiltersWrapper from "./FiltersWrapper";
import ListingsWrapper from "./listings/ListingsWrapper";
import Header from "./Header";

function BusinessContainer({ pageParam, sortParam, state, city }) {
  let page = 1;
  let sort = 1;

  // Validate Page Param
  if (!isNaN(pageParam) && pageParam >= 1) {
    page = Number(pageParam);
  }

  // Validate Sort Param
  const sortOptions = {
    most_reviews: 1,
    least_reviews: 2,
    highest_rating: 3,
    lowest_rating: 4,
  };
  if (sortOptions[sortParam]) {
    sort = sortOptions[sortParam];
  }

  // Get State Data
  const stateData = states.find((s) => s.code === state);
  if (!stateData) {
    return notFound();
  }

  // Get City Data
  let cityData = null;
  if (city) {
    cityData = cities.find(
      (c) => c.slug === city && c.state_id === stateData.id
    );
    if (!cityData) {
      return notFound();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header stateData={stateData} cityData={cityData} />

      <ToastProvider>
        <FilterProvider>
          {/* Filters */}
          <FiltersWrapper
            stateData={stateData}
            cityData={cityData}
            sort={sort}
          />

          {/* Business Listings */}
          <ListingsWrapper
            stateData={stateData}
            cityData={cityData}
            page={page}
          />
        </FilterProvider>
      </ToastProvider>
    </div>
  );
}

export default BusinessContainer;
