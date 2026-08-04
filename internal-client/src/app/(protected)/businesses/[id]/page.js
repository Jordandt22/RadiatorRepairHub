import { Suspense } from "react";
import BusinessDetailPageContent from "@/components/pages/businesses/BusinessDetailPageContent";
import BusinessDetailSkeleton from "@/components/pages/businesses/BusinessDetailSkeleton";

function BusinessDetailFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <BusinessDetailSkeleton />
    </div>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={<BusinessDetailFallback />}>
      <BusinessDetailPageContent />
    </Suspense>
  );
}
