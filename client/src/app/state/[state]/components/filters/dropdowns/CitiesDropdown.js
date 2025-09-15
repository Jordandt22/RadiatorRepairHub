"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";

// Components
import FilterDropdown from "../FilterDropdown";

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
    return <div className="py-8 text-center">Failed to load cities.</div>;
  if (!data) return <div className="py-8 text-center">Loading...</div>;

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
