import { Suspense } from "react";
import UsersPageContent from "@/components/pages/users/UsersPageContent";
import UsersTableSkeleton from "@/components/pages/users/UsersTableSkeleton";

function UsersPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <UsersTableSkeleton />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageFallback />}>
      <UsersPageContent />
    </Suspense>
  );
}
