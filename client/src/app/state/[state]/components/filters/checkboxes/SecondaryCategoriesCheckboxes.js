"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";

// Components
import FilterCheckboxes from "../FilterCheckboxes";

function SecondaryCategoriesCheckboxes() {
  const { data, error } = useSWR(
    [`${process.env.NEXT_PUBLIC_API_URI}/categories/secondary`],
    getFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: true,
    }
  );

  if (error)
    return (
      <div className="py-8 text-center">
        Failed to load secondary categories.
      </div>
    );
  if (!data) return <div className="py-8 text-center">Loading...</div>;

  const secondaryCategories = data.data;
  return (
    <FilterCheckboxes
      options={secondaryCategories}
      label="Secondary Categories"
      name="secondary_categories"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default SecondaryCategoriesCheckboxes;
