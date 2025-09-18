"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";

// Components
import FilterCheckboxes from "../inputs/FilterCheckboxes";
import CheckboxesErrorMessage from "@/components/status/Errors/CheckboxesErrorMessage";
import CheckboxesLoading from "@/components/status/Loading/CheckboxesLoading";

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
      <CheckboxesErrorMessage
        message={error.message || "Failed to load secondary categories."}
      />
    );
  if (!data) return <CheckboxesLoading label="Secondary Categories" />;

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
