import React from "react";

// Data
import SECONDARY_CATEGORIES from "@/lib/data/secondary_categories";

// Components
import FilterCheckboxes from "../inputs/FilterCheckboxes";

function SecondaryCategoriesCheckboxes() {
  return (
    <FilterCheckboxes
      options={SECONDARY_CATEGORIES}
      label="Secondary Categories"
      name="secondary_categories"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default SecondaryCategoriesCheckboxes;
