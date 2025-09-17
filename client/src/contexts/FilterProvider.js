"use client";

import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();
export const useFilters = () => useContext(FilterContext);
export function FilterProvider({ children }) {
  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  const defaultFilters = {
    title: "",
    state_id: "",
    city_id: "",
    total_score: 3,
    reviews_count: 1,
    primary_category_id: "",
    secondary_categories: [],
    features: [],
    openWeekdays: false,
    openWeekends: false,
  };
  const defaultAppliedFilters = {
    sort_option: 1,
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultAppliedFilters);

  // Clear all filters function
  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultAppliedFilters);
  };

  // Update filter function
  const updateFilter = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Handle array filter function
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

  // Update sort ascending function
  const updateSortOption = (value) => {
    setAppliedFilters((prev) => ({
      ...prev,
      sort_option: Number(value),
    }));
  };

  const getSortOption = (sortNum) => {
    const sortOptions = [
      "most_reviews",
      "least_reviews",
      "highest_rating",
      "lowest_rating",
    ];

    return sortOptions[sortNum - 1];
  };

  // Format filters function
  const formatFilters = (filters) => {
    const formattedFilters = {};

    Object.keys(filters).map((key) => {
      // Title Filter
      if (key === "title") {
        formattedFilters.title = filters[key];
      }

      // ID Filters
      const IDFilters = {
        state_id: true,
        city_id: true,
        primary_category_id: true,
      };
      if (IDFilters[key]) {
        const val = filters[key];
        if (val) {
          formattedFilters[key] = val;
        }
      }

      // Number Filters
      const NumberFilters = {
        total_score: true,
        reviews_count: true,
      };
      if (NumberFilters[key]) {
        const val = filters[key];
        if (val !== defaultFilters[key]) {
          formattedFilters[key] = val;
        }
      }

      // Array Filters
      const ArrayFilters = {
        secondary_categories: true,
      };
      if (ArrayFilters[key]) {
        const val = filters[key];
        if (val.length > 0) {
          formattedFilters[key] = val;
        }
      }

      // Features Filter
      if (filters.features.length > 0) {
        formattedFilters.features = {};
        filters.features.map(
          (item) => (formattedFilters.features[item] = true)
        );
      }

      // Open Hours Filter
      if (filters.openWeekdays || filters.openWeekends) {
        formattedFilters.open = {};
        formattedFilters.open.weekdays = filters.openWeekdays;
        formattedFilters.open.weekends = filters.openWeekends;
      }
    });

    setAppliedFilters((prev) => ({
      ...prev,
      ...formattedFilters,
    }));
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
        formatFilters,
        appliedFilters,
        updateSortOption,
        getSortOption,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
