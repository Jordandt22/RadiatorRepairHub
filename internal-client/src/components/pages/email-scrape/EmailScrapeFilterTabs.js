"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const VALID_TABS = ["jobs", "businesses"];

export default function EmailScrapeFilterTabs({ value, onValueChange }) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="businesses">Businesses</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
