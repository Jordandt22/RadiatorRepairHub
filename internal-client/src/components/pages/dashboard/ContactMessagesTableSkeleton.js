import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ContactMessagesTableSkeleton({ rows = 8 }) {
  return (
    <Table>
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
  );
}
