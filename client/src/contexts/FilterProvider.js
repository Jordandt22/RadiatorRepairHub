"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const FilterContext = createContext();
export const useFilters = () => useContext(FilterContext);
export function FilterProvider({ children }) {
  const router = useRouter();

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

  // Update filter
  const updateFilter = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Handle array filter
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

  // Update URL
  const updateURL = (stateData, cityData, page, readyFilters) => {
    const url = getPaginationLink(stateData, cityData, page, {
      ...readyFilters,
      sort_option: getSortOption(readyFilters.sort_option),
    });
    router.push(url);
  };

  // Clear all filters
  const clearAllFilters = (stateData, cityData) => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultAppliedFilters);
    setShowFilters(false);
    updateURL(stateData, cityData, 1, defaultAppliedFilters);
  };

  // Get sort option
  const getSortOption = (sortNum) => {
    const sortOptions = [
      "most_reviews",
      "least_reviews",
      "highest_rating",
      "lowest_rating",
    ];

    return sortOptions[sortNum - 1];
  };

  // Update sort ascending
  const updateSortOption = (value, stateData, cityData) => {
    setAppliedFilters((prev) => {
      const updatedFilters = {
        ...prev,
        sort_option: Number(value),
      };
      updateURL(stateData, cityData, 1, updatedFilters);

      return updatedFilters;
    });
    setShowFilters(false);
  };

  // Format filters
  const formatFilters = (filters, stateData, cityData, page) => {
    const formattedFilters = {};

    Object.keys(filters).map((key) => {
      // Text Filters
      const textFilters = {
        title: true,
        state_id: true,
        city_id: true,
        primary_category_id: true,
      };
      if (textFilters[key]) {
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

    setAppliedFilters((prev) => {
      const updatedFilters = {
        ...prev,
        ...formattedFilters,
      };
      updateURL(stateData, cityData, page, updatedFilters);

      return updatedFilters;
    });

    setShowFilters(false);
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
        updateURL,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
