"use client";

import {
  Building2Icon,
  ChevronDownIcon,
  MapPinIcon,
  TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SEARCH_STATS_DIMENSIONS = [
  { id: "state", label: "States", Icon: MapPinIcon },
  { id: "city", label: "Cities", Icon: Building2Icon },
  { id: "category", label: "Categories", Icon: TagIcon },
];

export default function SearchStatsDimensionTabs({ value, onValueChange }) {
  const triggerClassName =
    "cursor-pointer hover:translate-y-[-2px] transition-all duration-200 px-6 rounded-full md:px-8";
  const activeTab =
    SEARCH_STATS_DIMENSIONS.find((tab) => tab.id === value) ??
    SEARCH_STATS_DIMENSIONS[0];
  const ActiveIcon = activeTab.Icon;

  return (
    <>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-11 w-full justify-between rounded-full px-3 text-base font-medium md:px-4"
              />
            }
          >
            <span className="ml-2 flex items-center justify-center gap-2.5">
              <ActiveIcon className="size-4" />
              {activeTab.label}
            </span>
            <ChevronDownIcon className="size-5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--anchor-width) text-sm"
          >
            <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
              {SEARCH_STATS_DIMENSIONS.map(({ id, label, Icon }) => (
                <DropdownMenuRadioItem
                  key={id}
                  value={id}
                  className="min-h-9 py-2 text-sm [&_svg]:size-4"
                >
                  <Icon />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs
        value={value}
        onValueChange={onValueChange}
        className="hidden md:block"
      >
        <TabsList className="rounded-full">
          {SEARCH_STATS_DIMENSIONS.map(({ id, label, Icon }) => (
            <TabsTrigger key={id} value={id} className={triggerClassName}>
              <Icon data-icon="inline-center" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
