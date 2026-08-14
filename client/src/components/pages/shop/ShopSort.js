"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SHOP_SORT_OPTIONS = [
  { value: "alpha", label: "Alphabetical" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

function ShopSort({ sort, onSortChange }) {
  const current =
    SHOP_SORT_OPTIONS.find((option) => option.value === sort) ??
    SHOP_SORT_OPTIONS[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className="inline-flex w-full min-w-[11.5rem] cursor-pointer items-center justify-between gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors duration-200 hover:bg-muted sm:w-auto"
        aria-label="Sort products"
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44 rounded-lg">
        {SHOP_SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={`cursor-pointer rounded-md ${
              option.value === current.value ? "bg-tint text-primary" : ""
            }`}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShopSort;
