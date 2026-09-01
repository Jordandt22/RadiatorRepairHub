import {
  BarChart3Icon,
  ChevronDownIcon,
  ImageIcon,
  ListIcon,
  MailIcon,
  MapPinIcon,
  UsersIcon,
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

export const BUSINESS_DETAIL_TABS = [
  { value: "listing", label: "Listing", Icon: ListIcon },
  { value: "email", label: "Email", Icon: MailIcon },
  { value: "location", label: "Location", Icon: MapPinIcon },
  { value: "images", label: "Images", Icon: ImageIcon },
  { value: "analytics", label: "Analytics", Icon: BarChart3Icon },
  { value: "insights", label: "Insights", Icon: UsersIcon },
];

export const VALID_BUSINESS_DETAIL_TABS = BUSINESS_DETAIL_TABS.map(
  (tab) => tab.value
);

export function resolveBusinessDetailTab(tab) {
  return VALID_BUSINESS_DETAIL_TABS.includes(tab) ? tab : "listing";
}

export default function BusinessDetailTabs({ value, onValueChange }) {
  const triggerClassName =
    "cursor-pointer hover:translate-y-[-2px] transition-all duration-200 px-5 rounded-full";
  const activeTab =
    BUSINESS_DETAIL_TABS.find((tab) => tab.value === value) ??
    BUSINESS_DETAIL_TABS[0];
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
              {BUSINESS_DETAIL_TABS.map(({ value: tabValue, label, Icon }) => (
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
          {BUSINESS_DETAIL_TABS.map(({ value: tabValue, label, Icon }) => (
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
