"use client";

import { Eye, Pencil } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";

const tabsTriggerClassNames =
  "px-5 cursor-pointer transition-colors duration-200";

const hintClassNames =
  "w-full px-4 py-1 text-center text-sm text-primary bg-primary/20 rounded-full md:w-auto md:text-left";

export default function OwnerListingViewBar() {
  const { isOwner, view, setView } = useOwnerListingView();

  if (!isOwner) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-2 shadow-sm md:mb-8">
      <Tabs value={view} onValueChange={setView} className="w-full gap-0 md:w-auto">
        <TabsList aria-label="Listing view" className="w-full md:w-fit">
          <TabsTrigger value="preview" className={tabsTriggerClassNames}>
            <Eye aria-hidden="true" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit" className={tabsTriggerClassNames}>
            <Pencil aria-hidden="true" />
            Edit
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {view === "preview" ? (
        <p className={hintClassNames}>
          Preview what customers see.
        </p>
      ) : view === "edit" ? (
        <p className={hintClassNames}>
          Edit your listing and click preview to see the changes.
        </p>
      ) : null}
    </div>
  );
}
