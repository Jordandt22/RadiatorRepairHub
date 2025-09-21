"use client";

import React, { useEffect } from "react";

// Data
import FEATURES from "@/lib/data/features";
import STATES from "@/lib/data/states";
import CITIES from "@/lib/data/cities";
import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";
import SECONDARY_CATEGORIES from "@/lib/data/secondary_categories";

// Utils
import {
  validateArray,
  validateID,
  validateNumber,
  validateBoolean,
} from "@/lib/utils/utils";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import FiltersWrapper from "./FiltersWrapper";
import ListingsWrapper from "./listings/ListingsWrapper";

function ContentWrapper({ stateData, cityData, searchParams }) {
  const { page: pageParam, sort: sortParam } = searchParams;
  const { filters, setAppliedFilters, setFilters } = useFilters();
  let page = 1;

  // Validate Page Parma
  if (!isNaN(pageParam) && pageParam >= 1) {
    page = Number(pageParam);
  }

  useEffect(() => {
    const filterParams = { ...searchParams };
    delete filterParams.page;
    delete filterParams.sort;
    let sort = 1;
    let formattedFilters = {
      ...filters,
    };

    if (stateData) delete formattedFilters.state_id;
    if (cityData) delete formattedFilters.city_id;

    // Validate Sort Param
    const sortOptions = {
      most_reviews: 1,
      least_reviews: 2,
      highest_rating: 3,
      lowest_rating: 4,
    };
    if (sortParam && sortOptions[sortParam?.toLowerCase()]) {
      sort = sortOptions[sortParam.toLowerCase()];
    }

    // Validate Filter Params
    Object.keys(filterParams).map((key) => {
      const value = filterParams[key];

      // Validate Title
      if (key === "title") {
        let title = value.trim();
        if (title.length > 150) {
          formattedFilters.title = "";
        }

        const specialCharacters = new RegExp(
          /[!@#$%^*()+\=\[\]{};:"\\|,.<>\/?]/,
          "gi"
        );
        if (specialCharacters.test(title)) {
          title = "";
        }

        formattedFilters.title = title;
      }

      // Validate Total Score
      if (key === "total_score") {
        formattedFilters.total_score = validateNumber(value, 1, 5);
      }

      // Validate Reviews Count
      if (key === "reviews_count") {
        formattedFilters.reviews_count = validateNumber(value, 1, 500);
      }

      // Validate Primary Category
      if (key === "primary_category_id") {
        formattedFilters.primary_category_id = validateID(
          value,
          PRIMARY_CATEGORIES,
          "id"
        );
      }

      // Validate Secondary Categories
      if (key === "secondary_categories") {
        formattedFilters.secondary_categories = validateArray(
          SECONDARY_CATEGORIES,
          "id",
          formattedFilters,
          "secondary_categories",
          value
        );
      }

      // Validate City ID
      if (key === "city_id" && !cityData) {
        formattedFilters.city_id = validateID(value, CITIES, "id");
      }

      // Validate State ID
      if (key === "state_id" && !stateData) {
        formattedFilters.state_id = validateID(value, STATES, "id");
      }

      // Validate Weekdays
      if (key === "weekdays") {
        formattedFilters.open.weekdays = validateBoolean(value);
      }

      // Validate Weekends
      if (key === "weekends") {
        formattedFilters.open.weekends = validateBoolean(value);
      }

      // Validate Features
      if (key === "features") {
        formattedFilters.features = validateArray(
          FEATURES,
          "key",
          formattedFilters,
          "features",
          value
        );
      }
    });

    // Update Filters
    setFilters((prev) => ({
      ...prev,
      ...formattedFilters,
    }));

    // Update Applied Filters
    setAppliedFilters({
      ...formattedFilters,
      sort_option: sort,
    });
  }, [searchParams]);

  return (
    <>
      {/* Filters */}
      <FiltersWrapper stateData={stateData} cityData={cityData} page={page} />

      {/* Business Listings */}
      {/* <ListingsWrapper stateData={stateData} cityData={cityData} page={page} /> */}
    </>
  );
}

export default ContentWrapper;
