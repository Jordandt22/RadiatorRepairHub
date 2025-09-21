import React from "react";

// Data
import FEATURES from "@/lib/data/features.json";

// Components
import FilterCheckboxes from "../inputs/FilterCheckboxes";

function FeaturesCheckboxes() {
  return (
    <FilterCheckboxes
      options={FEATURES}
      label="Features"
      name="features"
      valueKey="key"
      labelKey="name"
    />
  );
}

export default FeaturesCheckboxes;
