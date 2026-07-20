import {
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  FlagIcon,
  InboxIcon,
  ListChecksIcon,
  SendIcon,
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

export const TAB_STATUS = {
  all: null,
  pending: "pending",
  approved: "approved",
  sent: "sent",
  in_progress: "in_progress",
  flagged: "flagged",
  archived: null,
};

export const VALID_TABS = Object.keys(TAB_STATUS);

const TAB_OPTIONS = [
  { value: "all", label: "All", Icon: InboxIcon },
  { value: "pending", label: "Pending", Icon: ClockIcon },
  { value: "approved", label: "Approved", Icon: CheckIcon },
  { value: "sent", label: "Sent", Icon: SendIcon },
  { value: "in_progress", label: "In Progress", Icon: ListChecksIcon },
  { value: "flagged", label: "Flagged", Icon: FlagIcon },
];

export default function StatusFilterTabs({ value, onValueChange }) {
  const triggerClassName =
    "cursor-pointer hover:translate-y-[-2px] transition-all duration-200 px-8 rounded-full";
  const activeTab =
    TAB_OPTIONS.find((tab) => tab.value === value) ?? TAB_OPTIONS[0];
  const ActiveIcon = activeTab.Icon;

  if (value === "archived") {
    return null;
  }

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
              {TAB_OPTIONS.map(({ value: tabValue, label, Icon }) => (
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

      <Tabs value={value} onValueChange={onValueChange} className="hidden md:block">
        <TabsList className="rounded-full">
          {TAB_OPTIONS.map(({ value: tabValue, label, Icon }) => (
            <TabsTrigger key={tabValue} value={tabValue} className={triggerClassName}>
              <Icon data-icon="inline-center" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
