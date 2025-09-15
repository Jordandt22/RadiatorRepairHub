import React from "react";

// Data
import features from "@/lib/data/features.json";

// Components
import FilterCheckboxes from "../FilterCheckboxes";

function FeaturesCheckboxes() {
  return (
    <FilterCheckboxes
      options={features}
      label="Features"
      name="features"
      valueKey="key"
      labelKey="name"
    />
  );
}

export default FeaturesCheckboxes;
