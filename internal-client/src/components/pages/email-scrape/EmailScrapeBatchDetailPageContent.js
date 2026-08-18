"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ShieldAlertIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import EmailScrapeStatusBadge from "@/components/pages/email-scrape/EmailScrapeStatusBadge";
import EmailCleanerStatusBadge from "@/components/pages/email-cleaner/EmailCleanerStatusBadge";
import EmailCleanerMarkStatusDialog from "@/components/pages/email-cleaner/EmailCleanerMarkStatusDialog";
import EmailScrapeMarkSuspiciousDialog from "@/components/pages/email-scrape/EmailScrapeMarkSuspiciousDialog";
import EmailScrapeTableSkeleton from "@/components/pages/email-scrape/EmailScrapeTableSkeleton";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import Pagination from "@/components/pages/dashboard/Pagination";
import { formatDate } from "@/components/pages/dashboard/formatDate";

const PAGE_SIZE = 20;

const OUTCOME_SORT_ORDER = {
  succeeded: 0,
  skipped: 1,
  failed: 2,
};

function isActiveStatus(status) {
  return ["pending", "running"].includes(status);
}

function paginateItems(items, page, pageSize) {
  const list = Array.isArray(items) ? items : [];
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    total,
    totalPages: total === 0 ? 0 : totalPages,
    items: list.slice(start, start + pageSize),
  };
}

function sortBusinessesByOutcome(businesses) {
  return [...businesses].sort((a, b) => {
    const aRank = OUTCOME_SORT_ORDER[a.outcome_status] ?? 99;
    const bRank = OUTCOME_SORT_ORDER[b.outcome_status] ?? 99;
    if (aRank !== bRank) return aRank - bRank;
    return String(a.title ?? "").localeCompare(String(b.title ?? ""));
  });
}

export default function EmailScrapeBatchDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.["batch_id"];
  const { accessToken, isReady, logout } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [paginationBatchId, setPaginationBatchId] = useState(batchId);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [markStatusOpen, setMarkStatusOpen] = useState(false);
  const [markSuspiciousOpen, setMarkSuspiciousOpen] = useState(false);
  const [markStatusError, setMarkStatusError] = useState(null);

  if (batchId !== paginationBatchId) {
    setPaginationBatchId(batchId);
    setPage(1);
    setSelectedIds(new Set());
  }

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["email-scrape-batch", batchId],
    enabled: Boolean(accessToken && batchId),
    refetchInterval: (query) => {
      const status = query.state.data?.batch?.status;
      return isActiveStatus(status) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi(`/admin/email-scrape/batches/${batchId}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load batch");
      }
      return result.data;
    },
  });

  const batch = detailQuery.data?.batch;
  const job = detailQuery.data?.job;
  const navigation = detailQuery.data?.navigation;
  const rawBusinesses = detailQuery.data?.businesses ?? [];

  const businesses = useMemo(() => {
    if (batch?.status === "completed") {
      return sortBusinessesByOutcome(rawBusinesses);
    }
    return rawBusinesses;
  }, [batch?.status, rawBusinesses]);

  const pagination = useMemo(
    () => paginateItems(businesses, page, PAGE_SIZE),
    [businesses, page],
  );

  if (pagination.page !== page) {
    setPage(pagination.page);
  }

  const pageIds = useMemo(
    () => pagination.items.map((row) => row.id).filter(Boolean),
    [pagination.items],
  );

  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    !allPageSelected && pageIds.some((id) => selectedIds.has(id));

  const markStatusMutation = useMutation({
    mutationFn: async (email_status) => {
      const result = await fetchApi("/admin/businesses/email-status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({
          business_ids: Array.from(selectedIds),
          email_status,
        }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(result.error.message || "Failed to mark status");
      }

      return result.data;
    },
    onMutate: () => {
      setMarkStatusError(null);
    },
    onSuccess: async () => {
      setMarkStatusOpen(false);
      setMarkSuspiciousOpen(false);
      setSelectedIds(new Set());
      setMarkStatusError(null);
      await queryClient.invalidateQueries({
        queryKey: ["email-scrape-batch", batchId],
      });
    },
    onError: (err) => {
      setMarkStatusError(err.message || "Failed to mark status");
    },
  });

  const handleToggleId = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleAll = (checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    setSelectedIds(new Set());
  };

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <Checkbox
            checked={allPageSelected}
            indeterminate={somePageSelected}
            disabled={pageIds.length === 0}
            onCheckedChange={(checked) => handleToggleAll(checked === true)}
            aria-label="Select all businesses on this page"
          />
        ),
        className: "w-10",
        render: (row) =>
          row.id ? (
            <Checkbox
              checked={selectedIds.has(row.id)}
              onCheckedChange={(next) =>
                handleToggleId(row.id, next === true)
              }
              aria-label={`Select ${row.title || "business"}`}
            />
          ) : null,
      },
      {
        key: "title",
        label: "Business",
        className: "w-[20%]",
        render: (row) => (
          <BusinessTitleLink
            id={row.id}
            title={row.title}
            slug={row.slug}
            titleClassName="font-semibold"
          />
        ),
      },
      {
        key: "outcome",
        label: "Outcome",
        className: "w-[12%]",
        render: (row) =>
          row.outcome_status ? (
            <EmailScrapeStatusBadge status={row.outcome_status} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: "email_status",
        label: "Email status",
        className: "w-[14%]",
        render: (row) =>
          row.email_status ? (
            <EmailCleanerStatusBadge status={row.email_status} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: "email",
        label: "Email",
        className: "w-[18%]",
        getValue: (row) => row.outcome_email || row.email || "—",
      },
      {
        key: "reason",
        label: "Reason",
        className: "w-[14%]",
        getValue: (row) => row.reason || "—",
      },
      {
        key: "attempts",
        label: "Attempts",
        className: "w-[8%]",
        getValue: (row) =>
          row.email_scraped_attempts == null
            ? "—"
            : String(row.email_scraped_attempts),
      },
      {
        key: "actions",
        label: "",
        className: "w-[10%] text-right",
        cellClassName: "text-right",
        render: (row) =>
          row.id ? (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              nativeButton={false}
              render={
                <Link
                  href={`/businesses/${row.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <EyeIcon />
              View
            </Button>
          ) : null,
      },
    ],
    [allPageSelected, somePageSelected, pageIds, selectedIds],
  );

  if (!isReady || !accessToken) return null;

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <EmailScrapeTableSkeleton />
      </div>
    );
  }

  const backHref = job?.id
    ? `/email-scrape/${job.id}`
    : "/email-scrape?tab=jobs";

  if (detailQuery.isError || !batch) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <Button
          variant="outline"
          size="sm"
          className="w-fit cursor-pointer"
          nativeButton={false}
          render={<Link href={backHref} />}
        >
          <ArrowLeftIcon />
          Back
        </Button>
        <p className="text-sm text-destructive">
          {detailQuery.error?.message || "Email scrape batch not found."}
        </p>
      </div>
    );
  }

  const batchCompleted = batch.status === "completed";
  const hasSelection = selectedIds.size > 0;
  const markStatusDisabled =
    !batchCompleted || !hasSelection || markStatusMutation.isPending;
  const prevBatchId = navigation?.prev_batch_id ?? null;
  const nextBatchId = navigation?.next_batch_id ?? null;
  const batchPosition = navigation?.position ?? (batch.batch_index ?? 0) + 1;
  const batchTotal = navigation?.total ?? null;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:gap-5 md:px-8 md:py-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-fit cursor-pointer"
            nativeButton={false}
            render={<Link href={backHref} />}
          >
            <ArrowLeftIcon />
            Back to job
          </Button>

          <div className="flex items-center gap-2">
            {batchTotal != null ? (
              <span className="text-sm text-muted-foreground">
                Batch {batchPosition} of {batchTotal}
              </span>
            ) : null}
            <Button
              variant="outline"
              size="icon-sm"
              className="cursor-pointer"
              disabled={!prevBatchId}
              aria-label="Previous batch"
              onClick={() => {
                if (!prevBatchId) return;
                router.push(`/email-scrape/batch/${prevBatchId}`);
              }}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="cursor-pointer"
              disabled={!nextBatchId}
              aria-label="Next batch"
              onClick={() => {
                if (!nextBatchId) return;
                router.push(`/email-scrape/batch/${nextBatchId}`);
              }}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Batch #{(batch.batch_index ?? 0) + 1}
          </h1>
          <EmailScrapeStatusBadge status={batch.status} />
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Created {formatDate(batch.created_at)}</span>
          {batch.started_at ? (
            <span>Started {formatDate(batch.started_at)}</span>
          ) : null}
          {batch.completed_at ? (
            <span>Completed {formatDate(batch.completed_at)}</span>
          ) : null}
          {batch.failed_at ? (
            <span>Failed {formatDate(batch.failed_at)}</span>
          ) : null}
          <span>{batch.business_count ?? 0} businesses selected</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <IngestCountBadge
            count={batch.succeeded_count ?? 0}
            tone="success"
          />
          <span className="self-center text-sm text-muted-foreground">
            succeeded
          </span>
          <IngestCountBadge count={batch.failed_count ?? 0} tone="danger" />
          <span className="self-center text-sm text-muted-foreground">
            failed
          </span>
          <IngestCountBadge count={batch.skipped_count ?? 0} />
          <span className="self-center text-sm text-muted-foreground">
            skipped
          </span>
        </div>

        {batch.failed_data?.message ? (
          <p className="text-sm text-destructive">{batch.failed_data.message}</p>
        ) : null}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Selected businesses ({businesses.length})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full"
              disabled={markStatusDisabled}
              onClick={() => {
                if (markStatusDisabled) return;
                setMarkStatusError(null);
                setMarkSuspiciousOpen(true);
              }}
            >
              <ShieldAlertIcon />
              Mark Suspicious
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full"
              disabled={markStatusDisabled}
              onClick={() => {
                if (markStatusDisabled) return;
                setMarkStatusError(null);
                setMarkStatusOpen(true);
              }}
            >
              <TagIcon />
              Mark Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full"
              disabled={!hasSelection || markStatusMutation.isPending}
              onClick={handleClearSelection}
            >
              <XIcon />
              Clear
            </Button>
            {hasSelection ? (
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
            ) : null}
          </div>
        </div>
        <IngestPayloadTable
          columns={columns}
          rows={pagination.items}
          emptyMessage="No businesses were selected for this batch."
          getRowKey={(row, index) => row.id || index}
        />
        {pagination.totalPages > 1 ? (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            displayPage={pagination.page}
            total={pagination.total}
            onPrevious={() => handlePageChange(Math.max(1, page - 1))}
            onNext={() =>
              handlePageChange(Math.min(pagination.totalPages || 1, page + 1))
            }
          />
        ) : null}
      </section>

      <EmailScrapeMarkSuspiciousDialog
        open={markSuspiciousOpen}
        onOpenChange={(open) => {
          if (markStatusMutation.isPending) return;
          setMarkSuspiciousOpen(open);
          if (!open) setMarkStatusError(null);
        }}
        selectedCount={selectedIds.size}
        onConfirm={() => markStatusMutation.mutate("suspicious")}
        confirmPending={markStatusMutation.isPending}
        confirmError={markStatusError}
      />
      <EmailCleanerMarkStatusDialog
        open={markStatusOpen}
        onOpenChange={(open) => {
          if (markStatusMutation.isPending) return;
          setMarkStatusOpen(open);
          if (!open) setMarkStatusError(null);
        }}
        selectedCount={selectedIds.size}
        onConfirm={(status) => markStatusMutation.mutate(status)}
        confirmPending={markStatusMutation.isPending}
        confirmError={markStatusError}
      />
    </div>
  );
}
