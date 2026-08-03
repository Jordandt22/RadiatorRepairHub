import { Suspense } from "react";
import IngestGroupDetailPageContent from "@/components/pages/add-businesses/IngestGroupDetailPageContent";
import IngestGroupsTableSkeleton from "@/components/pages/add-businesses/IngestGroupsTableSkeleton";

function GroupDetailFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <IngestGroupsTableSkeleton />
    </div>
  );
}

export default function IngestGroupPage() {
  return (
    <Suspense fallback={<GroupDetailFallback />}>
      <IngestGroupDetailPageContent />
    </Suspense>
  );
}
