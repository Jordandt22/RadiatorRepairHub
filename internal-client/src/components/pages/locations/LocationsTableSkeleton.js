import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLUMNS_BY_TAB = {
  states: ["State", "Businesses", "Percentage", "Cities", "Postal Codes"],
  cities: ["City", "State", "Businesses", "Percentage", "Postal Codes"],
  "postal-codes": ["Postal Code", "City", "State", "Businesses", "Percentage"],
  "data-issues": [
    "Business",
    "State",
    "Listed city",
    "Postal code",
    "Postal city",
    "Note",
  ],
};

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function LocationsTableSkeleton({
  activeTab = "states",
  rows = 8,
}) {
  const columns = COLUMNS_BY_TAB[activeTab] ?? COLUMNS_BY_TAB.states;

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((label) => (
                  <TableCell key={label}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
