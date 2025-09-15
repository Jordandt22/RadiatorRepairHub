"use client";

import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  // Filter state management
  const [filters, setFilters] = useState({
    city: "",
    minTotalScore: 3,
    minReviews: 1,
    primaryCategory: "",
    secondaryCategories: [],
    features: [],
    openWeekdays: false,
    openWeekends: false,
  });

  // Clear all filters function
  const clearAllFilters = () => {
    setFilters({
      city: "",
      minTotalScore: 3,
      minReviews: 1,
      primaryCategory: "",
      secondaryCategories: [],
      features: [],
      openWeekdays: false,
      openWeekends: false,
    });
  };

  // Update filter function
  const updateFilter = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const handleArrayFilter = (filterKey, value, checked) => {
    const currentArray = filters[filterKey] || [];
    if (checked) {
      updateFilter(filterKey, [...currentArray, value]);
    } else {
      updateFilter(
        filterKey,
        currentArray.filter((item) => item !== value)
      );
    }
  };

  return (
    <FilterContext.Provider
      value={{
        showFilters,
        setShowFilters,
        filters,
        clearAllFilters,
        updateFilter,
        handleArrayFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
