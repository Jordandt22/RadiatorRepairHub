import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-36 rounded-full" />
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-40 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="space-y-1.5 rounded-lg border border-border p-4"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="space-y-1.5 rounded-lg border border-border p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}
