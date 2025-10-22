"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

// Utils
import { formatFeatures } from "@/lib/utils/utils";

const FilterContext = createContext();
export const useFilters = () => useContext(FilterContext);
export function FilterProvider({ children }) {
  const router = useRouter();

  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  // Default filters
  const defaultFilters = {
    title: "",
    state_id: "",
    city_id: "",
    postal_code_id: "",
    total_score: 3,
    reviews_count: 1,
    primary_category_id: "",
    secondary_categories: [],
    features: [],
    open: {
      weekdays: false,
      weekends: false,
    },
  };

  // Used to store filters for the client to edit
  const [filters, setFilters] = useState(defaultFilters);

  // Used to store filters from query params
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Update filter
  const updateFilter = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Update Open Filter
  const updateOpenFilter = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      open: {
        ...prev.open,
        [filterKey]: value,
      },
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

  // Update Applied Filters
  const updateAppliedFilters = (filters, sortNum) => {
    setAppliedFilters((prev) => ({
      ...prev,
      ...filters,
      features: formatFeatures(filters.features),
      sort_option: sortNum || 1,
    }));
  };

  // Filter URL
  const getFilterURL = (stateData, cityData, page, filters) => {
    const paginationAndSortQueryParams = `page=${page}&sort=${getSortOption(
      filters.sort_option || 1
    )}`;
    delete filters.sort_option;
    if (stateData) delete filters.state_id;
    if (cityData) delete filters.city_id;

    let filterQueryParams = "";
    Object.keys(filters).map((key) => {
      let val = filters[key];
      const defaultVal = defaultFilters[key];

      if (typeof val === "string" && val !== defaultVal) {
        filterQueryParams += `&${key}=${val}`;
      }

      if (Array.isArray(val) && val.length > 0) {
        filterQueryParams += `&${key}=${val.join(",")}`;
      }

      if (typeof val === "number" && val !== defaultVal) {
        if (val <= 0) val = 1;
        filterQueryParams += `&${key}=${val}`;
      }

      if (key === "open") {
        if (val.weekdays) {
          filterQueryParams += "&weekdays=true";
        }
        if (val.weekends) {
          filterQueryParams += "&weekends=true";
        }
      }
    });

    if (stateData)
      return `/state/${stateData.code}${
        cityData ? `/city/${cityData.slug}` : ""
      }?${paginationAndSortQueryParams}${filterQueryParams}`;

    return `/search?${paginationAndSortQueryParams}${filterQueryParams}`;
  };

  // Update URL
  const updateURL = (stateData, cityData, page, filters) =>
    router.push(getFilterURL(stateData, cityData, page, filters));

  // Clear all filters
  const clearAllFiltersHelper = () => {
    setShowFilters(false);
    setFilters(defaultFilters);
    setAppliedFilters(null);
  };

  // Clear all filters
  const clearAllFilters = (stateData, cityData, appliedFilters) => {
    clearAllFiltersHelper();
    updateURL(stateData, cityData, 1, {
      ...defaultFilters,
      sort_option: appliedFilters?.sort_option || 1,
    });
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

  // Update Sort Option
  const updateSortOption = (stateData, cityData, filters, sortNum) => {
    updateAppliedFilters(filters, sortNum);
    updateURL(stateData, cityData, 1, {
      ...filters,
      sort_option: sortNum,
    });
  };

  // Format filters
  const formatFilters = (filters) => {
    let formattedFilters = {};
    Object.keys(filters).map((key) => {
      // Text Filters
      const textFilters = {
        title: true,
        state_id: true,
        city_id: true,
        postal_code_id: true,
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
        formattedFilters[key] = Number(filters[key]);
      }

      // Array Filters
      const ArrayFilters = {
        secondary_categories: true,
        features: true,
      };
      if (ArrayFilters[key]) {
        const val = filters[key];
        if (val.length > 0) {
          formattedFilters[key] = val;
        }
      }

      // Open Hours Filter
      if (filters.open.weekdays || filters.open.weekends) {
        formattedFilters.open = { ...filters.open };
      }
    });

    return formattedFilters;
  };

  // Apply filters
  const applyFilters = (filters, appliedFilters, stateData, cityData, page) => {
    const formattedFilters = formatFilters(filters);
    setShowFilters(false);
    setFilters((prev) => ({
      ...prev,
      ...formattedFilters,
    }));

    const sort_option = appliedFilters?.sort_option || 1;
    updateAppliedFilters(formattedFilters, sort_option);
    updateURL(stateData, cityData, page, {
      ...formattedFilters,
      sort_option,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        showFilters,
        setShowFilters,
        filters,
        clearAllFilters,
        updateFilter,
        updateOpenFilter,
        handleArrayFilter,
        applyFilters,
        getSortOption,
        updateURL,
        getFilterURL,
        appliedFilters,
        setAppliedFilters,
        setFilters,
        updateSortOption,
        clearAllFiltersHelper,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
