import { Suspense } from "react";
import UserDetailPageContent from "@/components/pages/users/UserDetailPageContent";
import UserDetailSkeleton from "@/components/pages/users/UserDetailSkeleton";

function UserDetailFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <UserDetailSkeleton />
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={<UserDetailFallback />}>
      <UserDetailPageContent />
    </Suspense>
  );
}
