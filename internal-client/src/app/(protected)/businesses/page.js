import { Suspense } from "react";
import BusinessesPageContent from "@/components/pages/businesses/BusinessesPageContent";
import BusinessesTableSkeleton from "@/components/pages/businesses/BusinessesTableSkeleton";

function BusinessesPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <BusinessesTableSkeleton />
    </div>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<BusinessesPageFallback />}>
      <BusinessesPageContent />
    </Suspense>
  );
}
