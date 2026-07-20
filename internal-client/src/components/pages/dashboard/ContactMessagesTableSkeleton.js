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
    <div className="rounded-lg border border-border bg-card p-2.5 md:p-3">
      <div className="flex items-start gap-3">
        <Skeleton className="size-4 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

export default function ContactMessagesTableSkeleton({ rows = 8 }) {
  return (
    <>
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="size-4" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: rows }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>

      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Skeleton className="size-4" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="size-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-6 w-14" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
