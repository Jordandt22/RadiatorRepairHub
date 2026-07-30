import { Suspense } from "react";
import ClaimRequestsPageContent from "@/components/pages/claim-requests/ClaimRequestsPageContent";
import ClaimRequestsTableSkeleton from "@/components/pages/claim-requests/ClaimRequestsTableSkeleton";

function ClaimRequestsPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <ClaimRequestsTableSkeleton />
    </div>
  );
}

export default function ClaimRequestsPage() {
  return (
    <Suspense fallback={<ClaimRequestsPageFallback />}>
      <ClaimRequestsPageContent />
    </Suspense>
  );
}
