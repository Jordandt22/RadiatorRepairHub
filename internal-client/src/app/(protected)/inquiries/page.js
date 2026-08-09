import { Suspense } from "react";
import InquiriesPageContent from "@/components/pages/inquiries/InquiriesPageContent";
import InquiriesTableSkeleton from "@/components/pages/inquiries/InquiriesTableSkeleton";

function InquiriesPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <InquiriesTableSkeleton />
    </div>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={<InquiriesPageFallback />}>
      <InquiriesPageContent />
    </Suspense>
  );
}
