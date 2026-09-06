import { Suspense } from "react";
import ClaimRequestDetailPageContent from "@/components/pages/claim-requests/ClaimRequestDetailPageContent";
import ClaimRequestDetailSkeleton from "@/components/pages/claim-requests/ClaimRequestDetailSkeleton";

function ClaimRequestDetailFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <ClaimRequestDetailSkeleton />
    </div>
  );
}

export default function ClaimRequestDetailPage() {
  return (
    <Suspense fallback={<ClaimRequestDetailFallback />}>
      <ClaimRequestDetailPageContent />
    </Suspense>
  );
}
