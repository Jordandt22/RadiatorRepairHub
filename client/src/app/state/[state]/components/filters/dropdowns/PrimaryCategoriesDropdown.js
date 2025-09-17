"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";

// Components
import FilterDropdown from "../FilterDropdown";
import DropdownErrorMessage from "@/components/Errors/DropdownErrorMessage";

function PrimaryCategoriesDropdown() {
  const { data, error } = useSWR(
    [`${process.env.NEXT_PUBLIC_API_URI}/categories/primary`],
    getFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: true,
    }
  );

  if (error)
    return (
      <DropdownErrorMessage
        message={error.message || "Failed to load primary categories."}
      />
    );
  if (!data) return <div className="py-8 text-center">Loading...</div>;

  const primaryCategories = data.data;
  return (
    <FilterDropdown
      options={primaryCategories}
      label="Primary Category"
      name="primary_category_id"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default PrimaryCategoriesDropdown;
