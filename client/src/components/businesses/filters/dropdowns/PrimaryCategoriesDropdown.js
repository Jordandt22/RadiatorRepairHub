import React from "react";

// Data
import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";

// Components
import FilterDropdown from "../inputs/FilterDropdown";

function PrimaryCategoriesDropdown() {
  return (
    <FilterDropdown
      options={PRIMARY_CATEGORIES}
      label="Primary Category"
      inputLabel="Primary Categories"
      name="primary_category_id"
      valueKey="id"
      labelKey="name"
    />
  );
}

export default PrimaryCategoriesDropdown;
