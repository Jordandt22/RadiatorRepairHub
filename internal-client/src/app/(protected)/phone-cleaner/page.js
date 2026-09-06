import { Suspense } from "react";
import PhoneCleanerPageContent from "@/components/pages/phone-cleaner/PhoneCleanerPageContent";
import PhoneCleanerTableSkeleton from "@/components/pages/phone-cleaner/PhoneCleanerTableSkeleton";

function PhoneCleanerPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <PhoneCleanerTableSkeleton />
    </div>
  );
}

export default function PhoneCleanerPage() {
  return (
    <Suspense fallback={<PhoneCleanerPageFallback />}>
      <PhoneCleanerPageContent />
    </Suspense>
  );
}
