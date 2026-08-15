"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import EmailCleanerMarkStatusDialog from "@/components/pages/email-cleaner/EmailCleanerMarkStatusDialog";
import EmailCleanerStatusBadge from "@/components/pages/email-cleaner/EmailCleanerStatusBadge";
import Pagination from "@/components/pages/dashboard/Pagination";
import { formatDate, formatFullDate } from "@/components/pages/dashboard/formatDate";
import { OUTREACH_TYPE_LABELS } from "@/components/pages/outreach/outreachConstants";
import { fetchApi } from "@/lib/api/fetchApi";

const HISTORY_PAGE_SIZE = 20;

function TypeBadge({ type }) {
  const label = OUTREACH_TYPE_LABELS[type] ?? type ?? "—";
  return (
    <Badge variant="outline" className="border-transparent bg-zinc-100 text-zinc-800">
      {label}
    </Badge>
  );
}

export default function BusinessDetailEmailTab({
  business,
  accessToken,
  logout,
  onMarkStatus,
  markStatusPending = false,
  markStatusError = null,
}) {
  const [markOpen, setMarkOpen] = useState(false);
  const [page, setPage] = useState(1);
  const businessId = business?.id;

  const historyQuery = useQuery({
    queryKey: ["admin-business-outreach-history", businessId, page],
    enabled: Boolean(accessToken && businessId),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(HISTORY_PAGE_SIZE),
        business_id: businessId,
      });
      const result = await fetchApi(`/admin/outreach/history?${params}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load emails sent");
      }
      return result.data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const history = historyQuery.data?.history ?? [];
  const total = historyQuery.data?.total ?? 0;
  const totalPages = Math.max(1, historyQuery.data?.totalPages ?? 1);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Email status</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={() => setMarkOpen(true)}
          >
            <PencilIcon />
            Edit status
          </Button>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BusinessDetailCard label="Email">
            {business.email ? (
              <a
                href={`mailto:${business.email}`}
                className="break-all underline underline-offset-2"
              >
                {business.email}
              </a>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
          <BusinessDetailCard label="Status">
            <EmailCleanerStatusBadge status={business.email_status} />
          </BusinessDetailCard>
          <BusinessDetailCard label="Marked at">
            {formatFullDate(business.email_status_marked_at)}
          </BusinessDetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Emails sent</h2>
        {historyQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading emails…</p>
        ) : historyQuery.isError ? (
          <p className="text-sm text-destructive">
            {historyQuery.error?.message || "Failed to load emails sent"}
          </p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No outreach emails have been sent to this business.
          </p>
        ) : (
          <>
            <div className="hidden min-w-0 md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[16%]">Type</TableHead>
                    <TableHead className="w-[22%]">Sent to</TableHead>
                    <TableHead className="w-[22%]">Current email</TableHead>
                    <TableHead className="w-[24%]">Subject</TableHead>
                    <TableHead className="w-[16%]">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((row) => (
                    <TableRow key={row.outreach_history_id}>
                      <TableCell>
                        <TypeBadge type={row.outreach_type} />
                      </TableCell>
                      <TableCell className="max-w-0">
                        <span className="block truncate">
                          {row.recipient || "—"}
                        </span>
                        {row.email_changed_or_missing ? (
                          <Badge
                            variant="outline"
                            className="mt-1 border-transparent bg-amber-100 text-amber-900"
                          >
                            Changed
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-0 truncate">
                        {row.business?.email || "—"}
                      </TableCell>
                      <TableCell className="max-w-0 truncate">
                        {row.subject || "—"}
                      </TableCell>
                      <TableCell>{formatDate(row.sent_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {history.map((row) => (
                <div
                  key={row.outreach_history_id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <TypeBadge type={row.outreach_type} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(row.sent_at)}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm">{row.subject || "—"}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    To {row.recipient || "—"}
                    {row.email_changed_or_missing ? " · contact changed" : ""}
                  </p>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              displayPage={page}
              total={total}
              isFetching={historyQuery.isFetching}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            />
          </>
        )}
      </section>

      <EmailCleanerMarkStatusDialog
        open={markOpen}
        onOpenChange={setMarkOpen}
        selectedCount={1}
        initialStatus={business.email_status}
        confirmPending={markStatusPending}
        confirmError={markStatusError}
        onConfirm={async (emailStatus) => {
          await onMarkStatus?.(emailStatus);
          setMarkOpen(false);
        }}
      />
    </div>
  );
}
