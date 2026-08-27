"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ACTIVITY_OPTIONS = [
  { id: "all", label: "All listings" },
  { id: "has_stats", label: "Has stats" },
  { id: "no_stats", label: "No stats" },
];

export default function BusinessesAnalyticsActions({
  searchValue = "",
  onSearchChange,
  activity = "all",
  onActivityChange,
  disabled = false,
}) {
  const selected =
    ACTIVITY_OPTIONS.find((option) => option.id === activity) ??
    ACTIVITY_OPTIONS[0];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1 md:max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search businesses…"
          aria-label="Search businesses"
          disabled={disabled}
          className="rounded-full pl-9"
        />
      </div>
      <div className="min-w-0 w-full sm:w-auto sm:min-w-44">
        <Select
          value={selected.id}
          onValueChange={(value) => onActivityChange?.(value)}
          disabled={disabled}
        >
          <SelectTrigger
            aria-label="Filter by activity"
            className="h-9 w-full rounded-full"
          >
            <SelectValue placeholder="Activity">{selected.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
