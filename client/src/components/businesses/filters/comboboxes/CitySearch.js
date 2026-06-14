"use client";

import React from "react";
import useSWR from "swr";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Utils
import { getFetcher } from "@/lib/utils/utils";
import { getLocationApiUrl } from "@/lib/api/location";

// Components
import FilterComboBox from "../inputs/FilterComboBox";

function CitySearch({ stateData }) {
  const { filters } = useFilters();

  const stateId = stateData?.id || filters.state_id;
  const citiesUrl = stateId
    ? getLocationApiUrl(`/states/${stateId}/cities`)
    : getLocationApiUrl("/cities");

  const { data } = useSWR(citiesUrl, getFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const citiesData = data?.data || [];

  return (
    <FilterComboBox
      options={citiesData}
      label="City"
      inputLabel="Cities"
      name="city_id"
      valueKey="id"
      labelKey="name"
      placeholder="Search cities..."
    />
  );
}

export default CitySearch;
