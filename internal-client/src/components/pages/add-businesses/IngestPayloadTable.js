"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function IngestPayloadTable({
  columns = [],
  rows = [],
  emptyMessage = "No items.",
  getRowKey,
  getRowClassName,
}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={getRowKey?.(row, index) ?? index}
              className={cn(getRowClassName?.(row, index))}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={column.cellClassName || "max-w-0"}
                >
                  {column.render ? (
                    column.render(row)
                  ) : (
                    <span className="block truncate">
                      {column.getValue?.(row) ?? "—"}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
