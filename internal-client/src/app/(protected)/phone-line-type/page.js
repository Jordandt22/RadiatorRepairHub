import { Suspense } from "react";
import PhoneLineTypePageContent from "@/components/pages/phone-line-type/PhoneLineTypePageContent";
import PhoneLineTypeTableSkeleton from "@/components/pages/phone-line-type/PhoneLineTypeTableSkeleton";

function PhoneLineTypeFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <PhoneLineTypeTableSkeleton />
    </div>
  );
}

export default function PhoneLineTypePage() {
  return (
    <Suspense fallback={<PhoneLineTypeFallback />}>
      <PhoneLineTypePageContent />
    </Suspense>
  );
}
