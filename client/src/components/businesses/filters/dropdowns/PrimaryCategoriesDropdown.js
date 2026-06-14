"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";
import { getCategoriesApiUrl } from "@/lib/api/categories";

// Components
import FilterDropdown from "../inputs/FilterDropdown";

function PrimaryCategoriesDropdown() {
  const { data } = useSWR(getCategoriesApiUrl("/primary"), getFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const categories = data?.data || [];

  return (
    <FilterDropdown
      options={categories}
      label="Primary Category"
      inputLabel="Primary Categories"
      name="primary_category_id"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default PrimaryCategoriesDropdown;
