import React from "react";

// Data
import cities from "@/lib/data/cities";

// Components
import FilterDropdown from "../inputs/FilterDropdown";

function CitiesDropdown({ stateData }) {
  const citiesData = cities.filter((city) => city.state_id === stateData.id);

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
