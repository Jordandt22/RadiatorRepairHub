import { Suspense } from "react";
import PhoneActivityPageContent from "@/components/pages/businesses/phone-activity/PhoneActivityPageContent";
import { PhoneActivityBusinessesSkeleton } from "@/components/pages/businesses/phone-activity/PhoneActivityBusinessesTable";

function PhoneActivityPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <PhoneActivityBusinessesSkeleton />
    </div>
  );
}

export default function PhoneActivityPage() {
  return (
    <Suspense fallback={<PhoneActivityPageFallback />}>
      <PhoneActivityPageContent />
    </Suspense>
  );
}
