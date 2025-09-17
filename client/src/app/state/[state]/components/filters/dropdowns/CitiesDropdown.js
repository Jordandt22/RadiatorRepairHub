"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";

// Components
import FilterDropdown from "../FilterDropdown";
import DropdownErrorMessage from "@/components/Errors/DropdownErrorMessage";
import DropdownLoading from "@/components/Loading/DropdownLoading";

function CitiesDropdown({ stateData }) {
  const { data, error } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_API_URI}/location/states/${stateData.id}/cities`,
    ],
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
        message={error.message || "Failed to load cities."}
      />
    );
  if (!data) return <DropdownLoading label="City" />;

  const cities = data.data;
  return (
    <FilterDropdown
      options={cities}
      label="City"
      name="city_id"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default CitiesDropdown;
