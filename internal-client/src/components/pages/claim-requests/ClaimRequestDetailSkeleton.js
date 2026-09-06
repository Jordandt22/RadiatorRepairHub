import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClaimRequestDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="space-y-1.5 rounded-lg border border-border p-4"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Consent version</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>User agent</TableHead>
              <TableHead>Created at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <div className="rounded-lg border border-border divide-y divide-border">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
