import { Suspense } from "react";
import UploadPhotosJobDetailPageContent from "@/components/pages/upload-photos/UploadPhotosJobDetailPageContent";
import UploadPhotosTableSkeleton from "@/components/pages/upload-photos/UploadPhotosTableSkeleton";

function UploadPhotosJobDetailFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <UploadPhotosTableSkeleton />
    </div>
  );
}

export default function UploadPhotosJobDetailPage() {
  return (
    <Suspense fallback={<UploadPhotosJobDetailFallback />}>
      <UploadPhotosJobDetailPageContent />
    </Suspense>
  );
}
