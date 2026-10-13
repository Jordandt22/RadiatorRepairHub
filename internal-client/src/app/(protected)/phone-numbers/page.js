import { Suspense } from "react";
import PhoneNumbersPageContent from "@/components/pages/phone-numbers/PhoneNumbersPageContent";
import PhoneNumbersTableSkeleton from "@/components/pages/phone-numbers/PhoneNumbersTableSkeleton";

function PhoneNumbersPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <PhoneNumbersTableSkeleton />
    </div>
  );
}

export default function PhoneNumbersPage() {
  return (
    <Suspense fallback={<PhoneNumbersPageFallback />}>
      <PhoneNumbersPageContent />
    </Suspense>
  );
}
