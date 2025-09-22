import React from "react";

// Data
import CITIES from "@/lib/data/cities";

// Components
import FilterComboBox from "../inputs/FilterComboBox";

function CitySearch({ stateData }) {
  // Filter cities based on selected state
  const citiesData = stateData
    ? CITIES.filter((city) => city.state_id === stateData?.id)
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
