import { Suspense } from "react";
import AddBusinessesPageContent from "@/components/pages/add-businesses/AddBusinessesPageContent";
import IngestGroupsTableSkeleton from "@/components/pages/add-businesses/IngestGroupsTableSkeleton";

function AddBusinessesFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <IngestGroupsTableSkeleton />
    </div>
  );
}

export default function AddBusinessesPage() {
  return (
    <Suspense fallback={<AddBusinessesFallback />}>
      <AddBusinessesPageContent />
    </Suspense>
  );
}
