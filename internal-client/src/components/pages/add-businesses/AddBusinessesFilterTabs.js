"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const VALID_TABS = ["groups"];

export default function AddBusinessesFilterTabs({ value, onValueChange }) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="groups">Groups</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
