import React from "react";

// Data
import STATES from "@/lib/data/states";

// Components
import FilterComboBox from "../inputs/FilterComboBox";

function StateSearch() {
  return (
    <FilterComboBox
      options={STATES}
      label="State"
      inputLabel="States"
      name="state_id"
      valueKey="id"
      labelKey="name"
      placeholder="Search states..."
    />
  );
}

export default StateSearch;
