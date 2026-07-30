import { Suspense } from "react";
import LocationsPageContent from "@/components/pages/locations/LocationsPageContent";
import LocationsTableSkeleton from "@/components/pages/locations/LocationsTableSkeleton";

function LocationsPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <LocationsTableSkeleton />
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Suspense fallback={<LocationsPageFallback />}>
      <LocationsPageContent />
    </Suspense>
  );
}
