"use client";

import React, { useEffect } from "react";

// Components
import FiltersWrapper from "./FiltersWrapper";
import ListingsWrapper from "./listings/ListingsWrapper";

function ContentWrapper({ stateData, cityData, searchParams }) {
  const { page: pageParam, sort: sortParam } = searchParams;
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

  // Validate & Format Filters

  useEffect(() => {
    // UPDATE CONTEXT
  }, []);

  return (
    <>
      {/* Filters */}
      <FiltersWrapper stateData={stateData} cityData={cityData} page={page} />

      {/* Business Listings */}
      <ListingsWrapper stateData={stateData} cityData={cityData} page={page} />
    </>
  );
}

export default ContentWrapper;
