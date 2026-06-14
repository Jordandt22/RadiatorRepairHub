"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

// Data
import FEATURES from "@/lib/data/features";
import STATES from "@/lib/data/states";

// Utils
import {
  validateArray,
  validateID,
  validateNumber,
  validateBoolean,
  formatFeatures,
  parseIdListParam,
} from "@/lib/utils/utils";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import FiltersWrapper from "./FiltersWrapper";
import ListingsWrapper from "./listings/ListingsWrapper";
import BranchBoundBanner from "../promo/BranchBoundBanner";

function ContentWrapper({ stateData, cityData, searchParams }) {
  const pathname = usePathname();
  const { page: pageParam, sort: sortParam } = searchParams;
  const {
    filters,
    appliedFilters,
    setAppliedFilters,
    setFilters,
    clearAllFiltersHelper,
  } = useFilters();
  const parsedPage = Number(pageParam);
  const page =
    !Number.isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  useEffect(() => {
    const whitelist = {
      search: true,
      state: true,
    };
    if (!whitelist[pathname.split("/")[1]]) {
      clearAllFiltersHelper();
      return;
    }

    const filterParams = { ...searchParams };
    delete filterParams.page;
    delete filterParams.sort;
    let sort = 1;
    let formattedFilters = { ...filters };

    if (stateData) delete formattedFilters.state_id;
    if (cityData) delete formattedFilters.city_id;

    // Preserve active filters when only the page param changes (city/state pages)
    if (appliedFilters) {
      formattedFilters = {
        ...formattedFilters,
        total_score: appliedFilters.total_score,
        reviews_count: appliedFilters.reviews_count,
        title: appliedFilters.title ?? formattedFilters.title,
        primary_category_id:
          appliedFilters.primary_category_id ?? formattedFilters.primary_category_id,
        secondary_categories:
          appliedFilters.secondary_categories ?? formattedFilters.secondary_categories,
        features: appliedFilters.features
          ? Object.keys(appliedFilters.features)
          : formattedFilters.features,
        open: appliedFilters.open ?? formattedFilters.open,
      };
    }

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
        formattedFilters.primary_category_id =
          typeof value === "string" ? value.trim() : "";
      }

      // Validate Secondary Categories
      if (key === "secondary_categories") {
        const fromUrl = parseIdListParam(value, 5);
        const merged = [...(formattedFilters.secondary_categories || [])];
        fromUrl.forEach((id) => {
          if (!merged.includes(id)) merged.push(id);
        });
        formattedFilters.secondary_categories = merged.slice(0, 5);
      }

      // Validate City ID
      if (key === "city_id" && !cityData) {
        formattedFilters.city_id =
          typeof value === "string" ? value.trim() : "";
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

    setAppliedFilters((prev) => ({
      ...prev,
      ...formattedFilters,
      features: formatFeatures(formattedFilters.features),
      sort_option: sort || 1,
    }));
  }, [searchParams, stateData, cityData, sortParam, pathname]);

  return (
    <>
      {/* Filters */}
      <FiltersWrapper stateData={stateData} cityData={cityData} page={page} />

      {/* Business Listings */}
      <ListingsWrapper stateData={stateData} cityData={cityData} page={page} />

      <BranchBoundBanner />
    </>
  );
}

export default ContentWrapper;
