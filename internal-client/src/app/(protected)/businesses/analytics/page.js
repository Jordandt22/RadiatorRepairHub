import { Suspense } from "react";
import BusinessesAnalyticsPageContent from "@/components/pages/businesses/listing-analytics/BusinessesAnalyticsPageContent";
import { BusinessesAnalyticsTableSkeleton } from "@/components/pages/businesses/listing-analytics/BusinessesAnalyticsTable";

function BusinessesAnalyticsPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <BusinessesAnalyticsTableSkeleton />
    </div>
  );
}

export default function BusinessesAnalyticsPage() {
  return (
    <Suspense fallback={<BusinessesAnalyticsPageFallback />}>
      <BusinessesAnalyticsPageContent />
    </Suspense>
  );
}
