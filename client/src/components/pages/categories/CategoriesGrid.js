import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Wrench,
  Car,
  Thermometer,
  Settings,
  Truck,
  Zap,
  Fuel,
  Package,
  Cog,
  Snowflake,
  Factory,
  Shield,
  Wind,
  Tag,
} from "lucide-react";
import CategorySearch from "./CategorySearch";
import CategorySort from "./CategorySort";

function BusinessCount({ count }) {
  const n = Number(count) || 0;
  return (
    <>
      <span className="font-semibold text-green-700">{n.toLocaleString()}</span>{" "}
      {n === 1 ? "Business" : "Businesses"}
    </>
  );
}

const getCategoryIcon = (categoryName) => {
  const name = (categoryName || "").toLowerCase();

  if (name.includes("air conditioning") || name.includes("ac")) {
    return Snowflake;
  }
  if (name.includes("tire")) {
    return Car;
  }
  if (name.includes("auto body") || name.includes("auto glass")) {
    return Shield;
  }
  if (name.includes("auto parts") || name.includes("auto machine")) {
    return Package;
  }
  if (name.includes("auto radiator")) {
    return Thermometer;
  }
  if (name.includes("auto repair")) {
    return Wrench;
  }
  if (name.includes("brake")) {
    return Shield;
  }
  if (name.includes("car repair") || name.includes("maintenance")) {
    return Settings;
  }
  if (name.includes("diesel") || name.includes("transmission")) {
    return Cog;
  }
  if (name.includes("gas station")) {
    return Fuel;
  }
  if (name.includes("manufacturer")) {
    return Factory;
  }
  if (name.includes("muffler")) {
    return Wind;
  }
  if (name.includes("radiator")) {
    return Thermometer;
  }
  if (name.includes("truck")) {
    return Truck;
  }
  if (name.includes("used auto parts")) {
    return Package;
  }
  if (name.includes("welder")) {
    return Zap;
  }
  if (name.includes("atv")) {
    return Car;
  }

  return Tag;
};

function CategoriesGrid({
  categories,
  searchTerm,
  onSearchChange,
  sort,
  onSortChange,
  totalCategories,
  filteredCount,
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-6 text-sm text-muted-foreground">
        <span className="font-semibold text-green-700">
          {(filteredCount ?? categories.length).toLocaleString()}
        </span>{" "}
        {(filteredCount ?? categories.length) === 1 ? "Category" : "Categories"}
        {searchTerm?.trim() && totalCategories
          ? ` of ${totalCategories.toLocaleString()}`
          : null}
      </p>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <CategorySearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <CategorySort sort={sort} onSortChange={onSortChange} />
      </div>

      {!categories || categories.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">
            No Categories Found
          </h2>
          <p className="text-muted-foreground">
            No categories match your search. Try a different name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                prefetch={false}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-200 hover:border-interactive"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tint">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-base font-semibold capitalize text-foreground">
                    {category.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    <BusinessCount count={category.business_count} />
                  </span>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-interactive"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoriesGrid;
