"use client";

import React from "react";
import useSWR from "swr";

// Utils
import { getFetcher } from "@/lib/utils/utils";
import { getLocationApiUrl } from "@/lib/api/location";

// Components
import FilterDropdown from "../inputs/FilterDropdown";

function CitiesDropdown({ stateData }) {
  const citiesUrl = stateData?.id
    ? getLocationApiUrl(`/states/${stateData.id}/cities`)
    : getLocationApiUrl("/cities");

  const { data } = useSWR(citiesUrl, getFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const citiesData = data?.data || [];

  return (
    <FilterDropdown
      options={citiesData}
      label="City"
      inputLabel="Cities"
      name="city_id"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default CitiesDropdown;
