"use client";

import { EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import IngestStatusBadge from "@/components/pages/add-businesses/IngestStatusBadge";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import { resolveBatchColor } from "@/components/pages/add-businesses/batchColors";
import { cn } from "@/lib/utils";

function shortId(id) {
  if (!id) return "—";
  return String(id).slice(0, 8);
}

export default function IngestBatchesTable({ batches = [], colorMap }) {
  const router = useRouter();

  if (batches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No batches yet.</p>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[14%]">Batch</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[10%]">Initial</TableHead>
            <TableHead className="w-[10%]">Result</TableHead>
            <TableHead className="w-[12%]">Enrich failed</TableHead>
            <TableHead className="w-[12%]">Insert failed</TableHead>
            <TableHead className="w-[14%]">Updated</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => {
            const color = resolveBatchColor(batch.id, colorMap);
            return (
              <TableRow
                key={batch.id}
                className={cn(
                  "group",
                  color?.border && "border-l-4",
                  color?.border,
                )}
              >
                <TableCell className="max-w-0 font-medium">
                  <div className="flex min-w-0 items-center gap-2">
                    {color ? (
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          color.dot,
                        )}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="block truncate" title={batch.id}>
                      {shortId(batch.id)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestStatusBadge status={batch.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge count={batch.initial_count} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge
                    count={batch.result_count}
                    tone="success"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge
                    count={batch.failed_enrichment_count}
                    tone="danger"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestCountBadge
                    count={batch.failed_insertion_count}
                    tone="danger"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(batch.updated_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {batch.status === "completed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 transition-all duration-200 group-hover:opacity-100 cursor-pointer hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                      onClick={() => router.push(`/batch/${batch.id}`)}
                    >
                      <EyeIcon />
                      View
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
