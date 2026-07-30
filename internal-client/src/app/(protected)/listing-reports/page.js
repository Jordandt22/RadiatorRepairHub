import { Suspense } from "react";
import ListingReportsPageContent from "@/components/pages/listing-reports/ListingReportsPageContent";
import ListingReportsTableSkeleton from "@/components/pages/listing-reports/ListingReportsTableSkeleton";

function ListingReportsPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <ListingReportsTableSkeleton />
    </div>
  );
}

export default function ListingReportsPage() {
  return (
    <Suspense fallback={<ListingReportsPageFallback />}>
      <ListingReportsPageContent />
    </Suspense>
  );
}
