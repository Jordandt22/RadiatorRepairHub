import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 size-4 shrink-0" />
        <Skeleton className="size-12 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
          <div className="flex gap-2 pt-0.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="mt-1 h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function AffiliateProductsTableSkeleton({ rows = 8 }) {
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="size-4" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Skeleton className="size-4" />
            </TableHead>
            <TableHead className="w-14">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Product link</TableHead>
            <TableHead>Affiliate link</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="size-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="size-10 rounded-md" />
              </TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
