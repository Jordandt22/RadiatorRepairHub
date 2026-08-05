import { Suspense } from "react";
import UploadPhotosPageContent from "@/components/pages/upload-photos/UploadPhotosPageContent";
import UploadPhotosTableSkeleton from "@/components/pages/upload-photos/UploadPhotosTableSkeleton";

function UploadPhotosFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <UploadPhotosTableSkeleton />
    </div>
  );
}

export default function UploadPhotosPage() {
  return (
    <Suspense fallback={<UploadPhotosFallback />}>
      <UploadPhotosPageContent />
    </Suspense>
  );
}
