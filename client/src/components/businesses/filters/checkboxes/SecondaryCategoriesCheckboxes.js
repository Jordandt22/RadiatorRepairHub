"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";
import { getCategoriesApiUrl } from "@/lib/api/categories";

// Components
import FilterCheckboxes from "../inputs/FilterCheckboxes";

function SecondaryCategoriesCheckboxes() {
  const { data } = useSWR(getCategoriesApiUrl("/secondary"), getFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const categories = data?.data || [];

  return (
    <FilterCheckboxes
      options={categories}
      label="Secondary Categories"
      name="secondary_categories"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default SecondaryCategoriesCheckboxes;
