"use client";

import React, { useEffect, useRef, useState } from "react";
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
import BusinessCount from "@/components/content/BusinessCount";
import AnimatedStaggerRows from "@/components/ui/AnimatedStaggerRows";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import CategorySearch from "./CategorySearch";
import CategorySort from "./CategorySort";

/** Display unit above the category count on /categories */
const CATEGORIES_DISPLAY_SLOT = "2090239571";

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

function CategoryCard({ category }) {
  const Icon = getCategoryIcon(category.name);
  return (
    <Link
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
}

function CategoriesGrid({
  categories,
  searchTerm,
  onSearchChange,
  sort,
  onSortChange,
  totalCategories,
  filteredCount,
}) {
  const isFirstRender = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setRefreshKey((key) => key + 1);
  }, [searchTerm, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AdSenseUnit
        slot={CATEGORIES_DISPLAY_SLOT}
        className="mb-6 min-h-[90px] overflow-hidden rounded-lg"
      />

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
        <AnimatedStaggerRows
          items={categories}
          getKey={(category) => category.id}
          refreshKey={refreshKey}
          renderItem={(category) => <CategoryCard category={category} />}
        />
      )}
    </div>
  );
}

export default CategoriesGrid;
