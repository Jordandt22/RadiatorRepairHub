import {
  BadgeCheckIcon,
  ChevronDownIcon,
  ClockIcon,
  ListIcon,
  StarIcon,
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

export const TAB_FILTERS = {
  all: { claimed: null, featured: null, recent: null },
  claimed: { claimed: true, featured: null, recent: null },
  featured: { claimed: null, featured: true, recent: null },
};

export const LISTING_TAB_FILTERS = {
  ...TAB_FILTERS,
  edited: { claimed: true, featured: null, recent: true },
};

/** @deprecated Prefer TAB_FILTERS */
export const TAB_CLAIMED = {
  all: null,
  claimed: true,
  featured: null,
};

export const VALID_TABS = Object.keys(TAB_FILTERS);
export const VALID_LISTING_TABS = Object.keys(LISTING_TAB_FILTERS);

export function isManagedListingTab(tab) {
  return tab === "claimed" || tab === "featured" || tab === "edited";
}

const TAB_OPTIONS = [
  { value: "all", label: "All", Icon: ListIcon },
  { value: "claimed", label: "Claimed", Icon: BadgeCheckIcon },
  { value: "featured", label: "Featured", Icon: StarIcon },
  { value: "edited", label: "Recently edited", Icon: ClockIcon },
];

export default function BusinessFilterTabs({
  value,
  onValueChange,
  includeEdited = false,
}) {
  const options = includeEdited
    ? TAB_OPTIONS
    : TAB_OPTIONS.filter((tab) => tab.value !== "edited");
  const triggerClassName =
    "cursor-pointer hover:translate-y-[-2px] transition-all duration-200 px-6 rounded-full md:px-8";
  const activeTab =
    options.find((tab) => tab.value === value) ?? options[0];
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
              {options.map(({ value: tabValue, label, Icon }) => (
                <DropdownMenuRadioItem
                  key={tabValue}
                  value={tabValue}
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
          {options.map(({ value: tabValue, label, Icon }) => (
            <TabsTrigger
              key={tabValue}
              value={tabValue}
              className={triggerClassName}
            >
              <Icon data-icon="inline-center" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
