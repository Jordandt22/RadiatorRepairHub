import { Skeleton } from "@/components/ui/skeleton";
import { isManagedListingTab } from "@/components/pages/businesses/BusinessFilterTabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CardSkeleton({ showOwnerEmail, showClaimInvite, showScore, showLastEdited }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          {showScore ? <Skeleton className="h-5 w-14 rounded-full" /> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
          {showOwnerEmail ? (
            <>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28" />
            </>
          ) : null}
          {showClaimInvite ? (
            <>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28" />
            </>
          ) : null}
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
          {showLastEdited ? (
            <>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </>
          ) : null}
        </div>
        <Skeleton className="mt-1 h-8 w-20" />
      </div>
    </div>
  );
}

export default function BusinessesTableSkeleton({
  rows = 8,
  activeTab = "all",
}) {
  const isManagedTab = isManagedListingTab(activeTab);
  const showOwnerEmail = isManagedTab;
  const showClaimInvite = isManagedTab;
  const showScore = activeTab === "all";
  const showLastEdited = isManagedTab;
  const showSelection = isManagedTab;

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex flex-col gap-3">
          {Array.from({ length: Math.min(rows, 5) }).map((_, index) => (
            <CardSkeleton
              key={index}
              showOwnerEmail={showOwnerEmail}
              showClaimInvite={showClaimInvite}
              showScore={showScore}
              showLastEdited={showLastEdited}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection ? <TableHead className="w-10" /> : null}
              <TableHead>Business</TableHead>
              {showScore ? <TableHead>Score</TableHead> : null}
              {showScore ? (
                <TableHead className="text-right">Reviews</TableHead>
              ) : null}
              <TableHead>Email</TableHead>
              {showOwnerEmail ? <TableHead>Owner email</TableHead> : null}
              {showClaimInvite ? <TableHead>Claim invite</TableHead> : null}
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              {showLastEdited ? <TableHead>Last edited</TableHead> : null}
              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                {showSelection ? (
                  <TableCell>
                    <Skeleton className="size-4" />
                  </TableCell>
                ) : null}
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </TableCell>
                {showScore ? (
                  <TableCell>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </TableCell>
                ) : null}
                {showScore ? (
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-5 w-14 rounded-full" />
                  </TableCell>
                ) : null}
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                {showOwnerEmail ? (
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                ) : null}
                {showClaimInvite ? (
                  <TableCell>
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </TableCell>
                ) : null}
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                {showLastEdited ? (
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ) : null}
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-8 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
