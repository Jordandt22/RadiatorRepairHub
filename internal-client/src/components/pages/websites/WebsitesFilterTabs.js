"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const VALID_TABS = ["businesses"];

export default function WebsitesFilterTabs({ value, onValueChange }) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="businesses">Businesses</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
