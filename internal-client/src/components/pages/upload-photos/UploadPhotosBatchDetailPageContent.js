"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import UploadPhotosStatusBadge from "@/components/pages/upload-photos/UploadPhotosStatusBadge";
import UploadPhotosTableSkeleton from "@/components/pages/upload-photos/UploadPhotosTableSkeleton";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import Pagination from "@/components/pages/dashboard/Pagination";
import { formatDate } from "@/components/pages/dashboard/formatDate";

const PAGE_SIZE = 20;

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

const BUSINESS_COLUMNS = [
  {
    key: "title",
    label: "Title",
    className: "w-[28%]",
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
    className: "w-[14%]",
    render: (row) =>
      row.outcome_status ? (
        <UploadPhotosStatusBadge status={row.outcome_status} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "error",
    label: "Error",
    className: "w-[18%]",
    getValue: (row) => row.error || "—",
  },
  {
    key: "attempts",
    label: "Attempts",
    className: "w-[10%]",
    getValue: (row) =>
      row.cdn_stored_attempts == null ? "—" : String(row.cdn_stored_attempts),
  },
  {
    key: "cdn",
    label: "CDN",
    className: "w-[8%]",
    getValue: (row) =>
      row.cdn_stored == null ? "—" : row.cdn_stored ? "Yes" : "No",
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
];

export default function UploadPhotosBatchDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.["batch_id"];
  const { accessToken, isReady, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [paginationBatchId, setPaginationBatchId] = useState(batchId);

  if (batchId !== paginationBatchId) {
    setPaginationBatchId(batchId);
    setPage(1);
  }

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["cdn-upload-batch", batchId],
    enabled: Boolean(accessToken && batchId),
    refetchInterval: (query) => {
      const status = query.state.data?.batch?.status;
      return isActiveStatus(status) ? 4000 : false;
    },
    queryFn: async () => {
      const result = await fetchApi(`/admin/cdn-upload/batches/${batchId}`, {
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
  const businesses = detailQuery.data?.businesses ?? [];

  const pagination = useMemo(
    () => paginateItems(businesses, page, PAGE_SIZE),
    [businesses, page],
  );

  if (pagination.page !== page) {
    setPage(pagination.page);
  }

  if (!isReady || !accessToken) return null;

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <UploadPhotosTableSkeleton />
      </div>
    );
  }

  const backHref = job?.id
    ? `/upload-photos/${job.id}`
    : "/upload-photos?tab=jobs";

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
          {detailQuery.error?.message || "CDN upload batch not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:gap-5 md:px-8 md:py-6">
      <div className="flex flex-col gap-3">
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

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Batch #{(batch.batch_index ?? 0) + 1}
          </h1>
          <UploadPhotosStatusBadge status={batch.status} />
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Selected businesses ({businesses.length})
        </h2>
        <IngestPayloadTable
          columns={BUSINESS_COLUMNS}
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
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              setPage((p) => Math.min(pagination.totalPages || 1, p + 1))
            }
          />
        ) : null}
      </section>
    </div>
  );
}
