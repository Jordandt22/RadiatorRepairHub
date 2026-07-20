import {
  ArchiveIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  InboxIcon,
  SendIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TAB_STATUS = {
  all: null,
  pending: "pending",
  approved: "approved",
  sent: "sent",
  flagged: "flagged",
  archived: null,
};

export const VALID_TABS = Object.keys(TAB_STATUS);

export default function StatusFilterTabs({ value, onValueChange }) {
  const triggerClassName =
    "cursor-pointer hover:translate-y-[-2px] transition-all duration-200 px-8 rounded-full";
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="rounded-full">
        <TabsTrigger value="all" className={triggerClassName}>
          <InboxIcon data-icon="inline-center" />
          All
        </TabsTrigger>
        <TabsTrigger value="pending" className={triggerClassName}>
          <ClockIcon data-icon="inline-center" />
          Pending
        </TabsTrigger>
        <TabsTrigger value="approved" className={triggerClassName}>
          <CheckIcon data-icon="inline-center" />
          Approved
        </TabsTrigger>
        <TabsTrigger value="sent" className={triggerClassName}>
          <SendIcon data-icon="inline-center" />
          Sent
        </TabsTrigger>
        <TabsTrigger value="flagged" className={triggerClassName}>
          <FlagIcon data-icon="inline-center" />
          Flagged
        </TabsTrigger>
        <TabsTrigger value="archived" className={triggerClassName}>
          <ArchiveIcon data-icon="inline-center" />
          Archived
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
