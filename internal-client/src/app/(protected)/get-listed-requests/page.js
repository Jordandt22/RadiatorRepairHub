import { Suspense } from "react";
import ListingRequestsPageContent from "@/components/pages/get-listed-requests/ListingRequestsPageContent";
import ListingRequestsTableSkeleton from "@/components/pages/get-listed-requests/ListingRequestsTableSkeleton";

function ListingRequestsPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <ListingRequestsTableSkeleton />
    </div>
  );
}

export default function ListingRequestsPage() {
  return (
    <Suspense fallback={<ListingRequestsPageFallback />}>
      <ListingRequestsPageContent />
    </Suspense>
  );
}
