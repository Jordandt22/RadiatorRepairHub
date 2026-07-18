import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TAB_STATUS = {
  all: null,
  approved: "approved",
  flagged: "flagged",
  sent: "sent",
};

export const VALID_TABS = Object.keys(TAB_STATUS);

export default function StatusFilterTabs({ value, onValueChange }) {

  const triggerClassName = "cursor-pointer hover:translate-y-[-2px] transition-all duration-200 px-4"
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="all" className={triggerClassName}>All</TabsTrigger>
        <TabsTrigger value="approved" className={triggerClassName}>Approved</TabsTrigger>
        <TabsTrigger value="flagged" className={triggerClassName}>Flagged</TabsTrigger>
        <TabsTrigger value="sent" className={triggerClassName}>Sent</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
