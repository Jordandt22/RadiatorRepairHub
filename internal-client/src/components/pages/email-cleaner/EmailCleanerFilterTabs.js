"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const VALID_TABS = ["cleaner", "review"];

export default function EmailCleanerFilterTabs({ value, onValueChange }) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="cleaner">Cleaner</TabsTrigger>
        <TabsTrigger value="review">Review</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
