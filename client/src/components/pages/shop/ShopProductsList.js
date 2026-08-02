"use client";

import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import AffiliateProductCard from "@/components/blogs/AffiliateProductCard";

function ShopProductsList({ products }) {
  const [searchTerm, setSearchTerm] = useState("");
  const query = searchTerm.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredProducts = useMemo(() => {
    if (!isSearching) return products;

    return products.filter((product) => {
      const title = product.title?.toLowerCase() ?? "";
      const description = product.description?.toLowerCase() ?? "";
      return title.includes(query) || description.includes(query);
    });
  }, [products, query, isSearching]);

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 font-heading text-xl font-bold text-gray-900">
          No Products Available
        </h2>
        <p className="text-gray-600">
          Check back soon for cooling system tools and supplies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm leading-5 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Search products"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400 transition-colors hover:text-red-400" />
          </button>
        ) : null}
      </div>

      {isSearching && filteredProducts.length === 0 ? (
        <div className="py-12 text-center">
          <h2 className="mb-2 font-heading text-xl font-bold text-gray-900">
            No Products Found
          </h2>
          <p className="text-gray-600">
            No products match your search. Try a different term.
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
