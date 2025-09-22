"use client";

import React from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Data
import CITIES from "@/lib/data/cities";

// Components
import FilterComboBox from "../inputs/FilterComboBox";

function CitySearch({ stateData }) {
  const { filters } = useFilters();

  // Filter cities based on selected state
  const citiesData = stateData
    ? CITIES.filter((city) => city.state_id === stateData?.id)
    : filters.state_id
    ? CITIES.filter((city) => city.state_id === filters.state_id)
    : CITIES;

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
