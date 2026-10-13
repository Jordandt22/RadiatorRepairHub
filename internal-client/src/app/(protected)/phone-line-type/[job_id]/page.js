import { Suspense } from "react";
import PhoneLineTypeJobDetailPageContent from "@/components/pages/phone-line-type/PhoneLineTypeJobDetailPageContent";
import PhoneLineTypeTableSkeleton from "@/components/pages/phone-line-type/PhoneLineTypeTableSkeleton";

function PhoneLineTypeJobDetailFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <PhoneLineTypeTableSkeleton />
    </div>
  );
}

export default function PhoneLineTypeJobDetailPage() {
  return (
    <Suspense fallback={<PhoneLineTypeJobDetailFallback />}>
      <PhoneLineTypeJobDetailPageContent />
    </Suspense>
  );
}
