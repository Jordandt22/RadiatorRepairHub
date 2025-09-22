import React from "react";

// Data
import STATES from "@/lib/data/states";

// Components
import FilterDropdown from "../inputs/FilterDropdown";

function StatesDropdown() {
  return (
    <FilterDropdown
      options={STATES}
      label="State"
      inputLabel="States"
      name="state_id"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default StatesDropdown;
