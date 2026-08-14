"use client";

import React, { useMemo, useState } from "react";
import AffiliateProductCard from "@/components/blogs/AffiliateProductCard";
import { AFFILIATE_PRODUCT_ALIASES } from "@/lib/affiliateProducts";
import ShopSearch from "./ShopSearch";
import ShopSort from "./ShopSort";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "coolant", label: "Coolant" },
  { value: "caps", label: "Caps" },
  { value: "tools", label: "Tools" },
];

const ALIAS_CATEGORY_BY_ID = {
  [AFFILIATE_PRODUCT_ALIASES.valvoline]: "coolant",
  [AFFILIATE_PRODUCT_ALIASES["prestone-asian"]]: "coolant",
  [AFFILIATE_PRODUCT_ALIASES["radiator-cap"]]: "caps",
  [AFFILIATE_PRODUCT_ALIASES["ir-thermometer"]]: "tools",
  [AFFILIATE_PRODUCT_ALIASES["coolant-funnel"]]: "tools",
};

function getProductTimestamp(date) {
  const parsed = Date.parse(date ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function inferProductCategory(product) {
  if (ALIAS_CATEGORY_BY_ID[product.id]) {
    return ALIAS_CATEGORY_BY_ID[product.id];
  }

  const text = `${product.title ?? ""} ${product.description ?? ""}`.toLowerCase();

  if (
    text.includes("coolant") ||
    text.includes("antifreeze") ||
    text.includes("prestone") ||
    text.includes("valvoline")
  ) {
    return "coolant";
  }

  if (text.includes("radiator cap") || /\bcap\b/.test(text)) {
    return "caps";
  }

  if (
    text.includes("funnel") ||
    text.includes("thermometer") ||
    text.includes("infrared") ||
    text.includes("tool") ||
    text.includes("kit")
  ) {
    return "tools";
  }

  return "tools";
}

function sortProducts(products, sort) {
  return [...products].sort((a, b) => {
    if (sort === "alpha") {
      return (a.title || "").localeCompare(b.title || "");
    }

    const diff =
      getProductTimestamp(b.created_at) - getProductTimestamp(a.created_at);
    if (diff !== 0) {
      return sort === "oldest" ? -diff : diff;
    }

    return (a.title || "").localeCompare(b.title || "");
  });
}

function ShopProductsList({ products }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("alpha");
  const [category, setCategory] = useState("all");

  const query = searchTerm.trim().toLowerCase();
  const isSearching = query.length > 0;
  const isFiltering = category !== "all" || isSearching;

  const filteredProducts = useMemo(() => {
    const matched = products.filter((product) => {
      if (category !== "all" && inferProductCategory(product) !== category) {
        return false;
      }

      if (!isSearching) return true;

      const title = product.title?.toLowerCase() ?? "";
      const description = product.description?.toLowerCase() ?? "";
      return title.includes(query) || description.includes(query);
    });

    return sortProducts(matched, sort);
  }, [products, query, isSearching, sort, category]);

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
          No Products Available
        </h2>
        <p className="text-muted-foreground">
          Check back soon for cooling system tools and supplies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-green-700">
          {filteredProducts.length.toLocaleString()}
        </span>{" "}
        {filteredProducts.length === 1 ? "Product" : "Products"}
        {isFiltering ? ` of ${products.length.toLocaleString()}` : null}
      </p>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((option) => {
          const isActive = category === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "border-primary/20 bg-tint text-primary"
                  : "border-border bg-card text-foreground hover:border-interactive"
              }`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <ShopSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <ShopSort sort={sort} onSortChange={setSort} />
      </div>

      {isFiltering && filteredProducts.length === 0 ? (
        <div className="py-12 text-center">
          <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
            No Products Found
          </h2>
          <p className="text-muted-foreground">
            No products match your filters. Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <AffiliateProductCard
              key={product.id}
              product={product}
              variant="shop"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopProductsList;
