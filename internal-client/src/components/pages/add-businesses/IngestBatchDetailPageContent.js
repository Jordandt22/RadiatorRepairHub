"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import IngestStatusBadge from "@/components/pages/add-businesses/IngestStatusBadge";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import IngestGroupsTableSkeleton from "@/components/pages/add-businesses/IngestGroupsTableSkeleton";
import { INGEST_INSERTED_COLUMNS } from "@/components/pages/add-businesses/ingestInsertedTable";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_SIZE = 10;

function text(value) {
  if (value == null || value === "") return "—";
  return String(value);
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

const FAILED_COLUMNS = [
  {
    key: "title",
    label: "Title",
    className: "w-[30%]",
    render: (row) => (
      <span className="block truncate font-semibold">
        {text(row.title || row.business?.title)}
      </span>
    ),
  },
  {
    key: "place_id",
    label: "Place ID",
    className: "w-[35%]",
    getValue: (row) =>
      text(row.placeId || row.place_id || row.business?.placeId),
  },
  {
    key: "error",
    label: "Error",
    className: "w-[35%]",
    cellClassName: "max-w-0 text-destructive",
    getValue: (row) => text(row.error),
  },
];

function isActiveBatch(status) {
  return ["pending", "enriching", "inserting"].includes(status);
}

export default function IngestBatchDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.["batch_id"];
  const { accessToken, isReady, logout } = useAuth();
  const queryClient = useQueryClient();
  const [paginationBatchId, setPaginationBatchId] = useState(batchId);
  const [insertedPage, setInsertedPage] = useState(1);
  const [insertFailedPage, setInsertFailedPage] = useState(1);
  const [enrichFailedPage, setEnrichFailedPage] = useState(1);
  const [retryError, setRetryError] = useState(null);
  const [retryMessage, setRetryMessage] = useState(null);

  if (batchId !== paginationBatchId) {
    setPaginationBatchId(batchId);
    setInsertedPage(1);
    setInsertFailedPage(1);
    setEnrichFailedPage(1);
  }

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["ingest-batch", batchId],
    enabled: Boolean(accessToken && batchId),
    refetchInterval: (query) => {
      const status = query.state.data?.batch?.status;
      if (status && isActiveBatch(status)) return 4000;
      return false;
    },
    queryFn: async () => {
      const result = await fetchApi(`/admin/ingest/batches/${batchId}`, {
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

  const retryMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi(
        `/admin/ingest/batches/${batchId}/retry`,
        {
          method: "POST",
          accessToken,
          body: JSON.stringify({ step: "auto" }),
        },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to retry batch");
      }
      return result.data;
    },
    onMutate: () => {
      setRetryError(null);
      setRetryMessage(null);
    },
    onSuccess: async (data) => {
      setRetryMessage(
        data?.step === "insert"
          ? "Insert job enqueued."
          : "Enrich job enqueued.",
      );
      await queryClient.invalidateQueries({
        queryKey: ["ingest-batch", batchId],
      });
      const groupId = detailQuery.data?.group?.id;
      if (groupId) {
        await queryClient.invalidateQueries({
          queryKey: ["ingest-group", groupId],
        });
      }
    },
    onError: (err) => {
      setRetryError(err.message || "Failed to retry batch");
    },
  });

  const insertedPagination = useMemo(
    () =>
      paginateItems(detailQuery.data?.batch?.inserted, insertedPage, PAGE_SIZE),
    [detailQuery.data?.batch?.inserted, insertedPage],
  );
  const insertFailedPagination = useMemo(
    () =>
      paginateItems(
        detailQuery.data?.batch?.insert_failed,
        insertFailedPage,
        PAGE_SIZE,
      ),
    [detailQuery.data?.batch?.insert_failed, insertFailedPage],
  );
  const enrichFailedPagination = useMemo(
    () =>
      paginateItems(
        detailQuery.data?.batch?.enrich_failed,
        enrichFailedPage,
        PAGE_SIZE,
      ),
    [detailQuery.data?.batch?.enrich_failed, enrichFailedPage],
  );

  if (insertedPagination.page !== insertedPage) {
    setInsertedPage(insertedPagination.page);
  }
  if (insertFailedPagination.page !== insertFailedPage) {
    setInsertFailedPage(insertFailedPagination.page);
  }
  if (enrichFailedPagination.page !== enrichFailedPage) {
    setEnrichFailedPage(enrichFailedPagination.page);
  }

  if (!isReady || !accessToken) return null;

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <IngestGroupsTableSkeleton />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.batch) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:px-8 md:py-6">
        <p className="text-sm text-rose-600">
          {detailQuery.error?.message || "Batch not found"}
        </p>
      </div>
    );
  }

  const { batch, group } = detailQuery.data;
  const retryEligible = Boolean(batch.retry?.eligible);
  const retryStep = batch.retry?.step;
  const retryLabel =
    retryStep === "insert" ? "Retry insert" : "Retry enrich";

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-10 px-4 py-4 md:gap-12 md:px-8 md:py-6">
      <div className="flex flex-col gap-2">
        {group ? (
          <Button
            variant="outline"
            size="sm"
            className="w-fit cursor-pointer rounded-full px-6"
            nativeButton={false}
            render={<Link href={`/group/${group.id}`} />}
          >
            <ArrowLeftIcon />
            Back to Group
          </Button>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Batch {String(batch.id).slice(0, 8)}
          </h1>
          <IngestStatusBadge status={batch.status} />
          {retryEligible ? (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full px-4"
              disabled={retryMutation.isPending}
              onClick={() => retryMutation.mutate()}
            >
              <RefreshCwIcon
                className={
                  retryMutation.isPending ? "animate-spin" : undefined
                }
              />
              {retryLabel}
            </Button>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          <span title={batch.id}>{batch.id}</span>
          {group ? (
            <>
              {" · "}
              <Link
                href={`/group/${group.id}`}
                className="underline-offset-2 hover:underline"
              >
                {group.name}
              </Link>
            </>
          ) : null}
          {" · "}
          {batch.result_count} inserted · {batch.failed_insertion_count} insert
          failed · {batch.failed_enrichment_count} enrich failed
        </p>
        {retryError ? (
          <p className="text-sm text-destructive">{retryError}</p>
        ) : null}
        {retryMessage ? (
          <p className="text-sm text-muted-foreground">{retryMessage}</p>
        ) : null}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Inserted ({insertedPagination.total})
        </h2>
        <IngestPayloadTable
          columns={INGEST_INSERTED_COLUMNS}
          rows={insertedPagination.items}
          emptyMessage="No inserted businesses yet."
          getRowKey={(row, index) => row.id || row.place_id || index}
        />
        <Pagination
          page={insertedPagination.page}
          totalPages={insertedPagination.totalPages}
          displayPage={insertedPagination.page}
          total={insertedPagination.total}
          onPrevious={() => setInsertedPage((page) => Math.max(1, page - 1))}
          onNext={() =>
            setInsertedPage((page) =>
              Math.min(insertedPagination.totalPages || 1, page + 1),
            )
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Insert failed ({insertFailedPagination.total})
        </h2>
        <IngestPayloadTable
          columns={FAILED_COLUMNS}
          rows={insertFailedPagination.items}
          emptyMessage="No insert failures."
          getRowKey={(row, index) => row.placeId || row.title || index}
        />
        <Pagination
          page={insertFailedPagination.page}
          totalPages={insertFailedPagination.totalPages}
          displayPage={insertFailedPagination.page}
          total={insertFailedPagination.total}
          onPrevious={() =>
            setInsertFailedPage((page) => Math.max(1, page - 1))
          }
          onNext={() =>
            setInsertFailedPage((page) =>
              Math.min(insertFailedPagination.totalPages || 1, page + 1),
            )
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Enrich failed ({enrichFailedPagination.total})
        </h2>
        <IngestPayloadTable
          columns={FAILED_COLUMNS}
          rows={enrichFailedPagination.items}
          emptyMessage="No enrich failures."
          getRowKey={(row, index) => row.placeId || row.title || index}
        />
        <Pagination
          page={enrichFailedPagination.page}
          totalPages={enrichFailedPagination.totalPages}
          displayPage={enrichFailedPagination.page}
          total={enrichFailedPagination.total}
          onPrevious={() =>
            setEnrichFailedPage((page) => Math.max(1, page - 1))
          }
          onNext={() =>
            setEnrichFailedPage((page) =>
              Math.min(enrichFailedPagination.totalPages || 1, page + 1),
            )
          }
        />
      </section>
    </div>
  );
}
