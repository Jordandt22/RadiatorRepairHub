import React from "react";
import { Search, X } from "lucide-react";

function ShopSearch({ searchTerm, onSearchChange }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="max-w-2xl">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
            className="block w-full rounded-full border border-border bg-card py-3 pr-10 pl-10 text-sm leading-5 text-foreground placeholder-muted-foreground outline-none focus:border-ring"
            aria-label="Search products"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
              aria-label="Clear product search"
            >
              <X className="h-5 w-5 text-muted-foreground duration-200 hover:text-destructive" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ShopSearch;
