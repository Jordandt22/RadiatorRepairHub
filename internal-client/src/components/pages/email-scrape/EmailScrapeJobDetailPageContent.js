"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailScrapeStatusBadge from "@/components/pages/email-scrape/EmailScrapeStatusBadge";
import EmailCleanerStatusBadge from "@/components/pages/email-cleaner/EmailCleanerStatusBadge";
import EmailScrapeTableSkeleton from "@/components/pages/email-scrape/EmailScrapeTableSkeleton";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import Pagination from "@/components/pages/dashboard/Pagination";
import { formatDate } from "@/components/pages/dashboard/formatDate";

const PAGE_SIZE = 20;

const OUTCOME_COLUMNS = [
  {
    key: "title",
    label: "Title",
    className: "w-[20%]",
    render: (row) => (
      <span className="block truncate font-semibold">{row.title || "—"}</span>
    ),
  },
  {
    key: "website",
    label: "Website",
    className: "w-[16%]",
    getValue: (row) => row.website || "—",
  },
  {
    key: "status",
    label: "Outcome",
    className: "w-[12%]",
    render: (row) => <EmailScrapeStatusBadge status={row.status} />,
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
    getValue: (row) => row.email || "—",
  },
  {
    key: "reason",
    label: "Reason",
    className: "w-[20%]",
    getValue: (row) => row.reason || row.error || "—",
  },
];

const BATCH_COLUMNS = [
  {
    key: "batch",
    label: "Batch",
    className: "w-[10%]",
    getValue: (row) => `#${(row.batch_index ?? 0) + 1}`,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[14%]",
    render: (row) => <EmailScrapeStatusBadge status={row.status} />,
  },
  {
    key: "businesses",
    label: "Businesses",
    className: "w-[12%]",
    getValue: (row) => String(row.business_count ?? 0),
  },
  {
    key: "succeeded",
    label: "Succeeded",
    className: "w-[12%]",
    render: (row) => (
      <IngestCountBadge count={row.succeeded_count ?? 0} tone="success" />
    ),
  },
  {
    key: "failed",
    label: "Failed",
    className: "w-[12%]",
    render: (row) => (
      <IngestCountBadge count={row.failed_count ?? 0} tone="danger" />
    ),
  },
  {
    key: "skipped",
    label: "Skipped",
    className: "w-[12%]",
    render: (row) => <IngestCountBadge count={row.skipped_count ?? 0} />,
  },
  {
    key: "updated",
    label: "Updated",
    className: "w-[14%]",
    getValue: (row) =>
      formatDate(row.completed_at || row.failed_at || row.started_at || row.created_at),
  },
  {
    key: "actions",
    label: "",
    className: "w-[14%] text-right",
    cellClassName: "text-right",
    render: (row) => (
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        nativeButton={false}
        render={<Link href={`/email-scrape/batch/${row.id}`} />}
      >
        <EyeIcon />
        View
      </Button>
    ),
  },
];

function isActiveJob(status) {
  return ["pending", "running"].includes(status);
}

function hasActiveBatches(batches = []) {
  return batches.some((batch) => isActiveJob(batch.status));
}

function paginateItems(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    total,
    totalPages: total === 0 ? 0 : totalPages,
    items: items.slice(start, start + pageSize),
  };
}

export default function EmailScrapeJobDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.["job_id"];
  const { accessToken, isReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("batches");
  const [page, setPage] = useState(1);
  const [paginationJobId, setPaginationJobId] = useState(jobId);

  if (jobId !== paginationJobId) {
    setPaginationJobId(jobId);
    setActiveTab("batches");
    setPage(1);
  }

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["email-scrape-job", jobId],
    enabled: Boolean(accessToken && jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (isActiveJob(data.job?.status)) return 4000;
      if (hasActiveBatches(data.batches)) return 4000;
      return false;
    },
    queryFn: async () => {
      const result = await fetchApi(`/admin/email-scrape/jobs/${jobId}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load job");
      }
      return result.data;
    },
  });

  const job = detailQuery.data?.job;
  const batches = detailQuery.data?.batches ?? [];
  const results = Array.isArray(job?.result_payload) ? job.result_payload : [];

  const grouped = useMemo(() => {
    return {
      batches,
      succeeded: results.filter((r) => r.status === "succeeded"),
      failed: results.filter((r) => r.status === "failed"),
      skipped: results.filter((r) => r.status === "skipped"),
    };
  }, [batches, results]);

  const activeRows =
    activeTab === "batches" ? grouped.batches : grouped[activeTab] ?? [];
  const pagination = useMemo(
    () => paginateItems(activeRows, page, PAGE_SIZE),
    [activeRows, page],
  );

  if (pagination.page !== page) {
    setPage(pagination.page);
  }

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  if (!isReady || !accessToken) return null;

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <EmailScrapeTableSkeleton />
      </div>
    );
  }

  if (detailQuery.isError || !job) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <Button
          variant="outline"
          size="sm"
          className="w-fit cursor-pointer"
          nativeButton={false}
          render={<Link href="/email-scrape?tab=jobs" />}
        >
          <ArrowLeftIcon />
          Back to jobs
        </Button>
        <p className="text-sm text-destructive">
          {detailQuery.error?.message || "Email scrape job not found."}
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
          render={<Link href="/email-scrape?tab=jobs" />}
        >
          <ArrowLeftIcon />
          Back to jobs
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Email scrape job
          </h1>
          <EmailScrapeStatusBadge status={job.status} />
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Created {formatDate(job.created_at)}</span>
          {job.started_at ? (
            <span>Started {formatDate(job.started_at)}</span>
          ) : null}
          {job.completed_at ? (
            <span>Completed {formatDate(job.completed_at)}</span>
          ) : null}
          {job.failed_at ? (
            <span>Failed {formatDate(job.failed_at)}</span>
          ) : null}
          <span>
            Batches {job.completed_batches ?? 0}/{job.total_batches ?? 0}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <IngestCountBadge count={job.selected_count ?? 0} />
          <span className="text-sm text-muted-foreground self-center">
            selected
          </span>
          <IngestCountBadge
            count={job.succeeded_count ?? 0}
            tone="success"
          />
          <span className="text-sm text-muted-foreground self-center">
            succeeded
          </span>
          <IngestCountBadge count={job.failed_count ?? 0} tone="danger" />
          <span className="text-sm text-muted-foreground self-center">
            failed
          </span>
          <IngestCountBadge count={job.skipped_count ?? 0} />
          <span className="text-sm text-muted-foreground self-center">
            skipped
          </span>
        </div>

        {job.failed_data?.message ? (
          <p className="text-sm text-destructive">{job.failed_data.message}</p>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="batches">
            Batches ({grouped.batches.length})
          </TabsTrigger>
          <TabsTrigger value="succeeded">
            Succeeded ({grouped.succeeded.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({grouped.failed.length})
          </TabsTrigger>
          <TabsTrigger value="skipped">
            Skipped ({grouped.skipped.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          <IngestPayloadTable
            columns={activeTab === "batches" ? BATCH_COLUMNS : OUTCOME_COLUMNS}
            rows={pagination.items}
            emptyMessage={
              activeTab === "batches"
                ? "No batches yet."
                : `No ${activeTab} businesses.`
            }
            getRowKey={(row, index) =>
              row.id ||
              row.business_id ||
              `${activeTab}-${index}`
            }
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
