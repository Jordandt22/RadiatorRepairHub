"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IngestStatusBadge from "@/components/pages/add-businesses/IngestStatusBadge";
import IngestBatchesTable from "@/components/pages/add-businesses/IngestBatchesTable";
import IngestJobsTable from "@/components/pages/add-businesses/IngestJobsTable";
import IngestBatchOutcomesChart from "@/components/pages/add-businesses/IngestBatchOutcomesChart";
import IngestPayloadTable from "@/components/pages/add-businesses/IngestPayloadTable";
import IngestFilterReasonBadges from "@/components/pages/add-businesses/IngestFilterReasonBadges";
import IngestGroupsTableSkeleton from "@/components/pages/add-businesses/IngestGroupsTableSkeleton";
import { INGEST_INSERTED_COLUMNS } from "@/components/pages/add-businesses/ingestInsertedTable";
import { buildBatchColorMap } from "@/components/pages/add-businesses/batchColors";
import Pagination from "@/components/pages/dashboard/Pagination";

const ALL_BATCHES = "All";
const JOBS_PAGE_SIZE = 10;
const INSERTED_PAGE_SIZE = 20;
const FILTERED_OUT_PAGE_SIZE = 20;
const GROUP_TABS = {
  batches: "batches",
  filteredOut: "filtered-out",
};

const FILTERED_OUT_COLUMNS = [
  {
    key: "title",
    label: "Title",
    className: "w-[28%]",
    render: (row) => (
      <span className="block truncate font-semibold">{row.title || "—"}</span>
    ),
  },
  {
    key: "category",
    label: "Category",
    className: "w-[22%]",
    getValue: (row) => row.categoryName || "—",
  },
  {
    key: "address",
    label: "Address",
    className: "w-[25%]",
    getValue: (row) => row.address || "—",
  },
  {
    key: "reason",
    label: "Reason",
    className: "w-[25%]",
    cellClassName: "max-w-0",
    render: (row) => <IngestFilterReasonBadges reason={row.reason} />,
  },
];

function isActiveGroup(status) {
  return ["pending", "filtering", "processing"].includes(status);
}

function hasIncompleteBatches(batches = []) {
  return batches.some(
    (batch) => batch.status !== "completed" && batch.status !== "failed",
  );
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

export default function IngestGroupDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.["group_id"];
  const { accessToken, isReady, logout } = useAuth();
  const [jobsBatchFilter, setJobsBatchFilter] = useState(ALL_BATCHES);
  const [paginationGroupId, setPaginationGroupId] = useState(groupId);
  const [jobsPage, setJobsPage] = useState(1);
  const [insertedPage, setInsertedPage] = useState(1);
  const [filteredOutPage, setFilteredOutPage] = useState(1);
  const [activeTab, setActiveTab] = useState(GROUP_TABS.batches);

  if (groupId !== paginationGroupId) {
    setPaginationGroupId(groupId);
    setJobsBatchFilter(ALL_BATCHES);
    setJobsPage(1);
    setInsertedPage(1);
    setFilteredOutPage(1);
    setActiveTab(GROUP_TABS.batches);
  }

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["ingest-group", groupId],
    enabled: Boolean(accessToken && groupId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (isActiveGroup(data.group?.status)) return 4000;
      if (hasIncompleteBatches(data.batches)) return 4000;
      return false;
    },
    queryFn: async () => {
      const result = await fetchApi(`/admin/ingest/groups/${groupId}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load group");
      }
      return result.data;
    },
  });

  const batches = detailQuery.data?.batches ?? [];
  const colorMap = useMemo(() => buildBatchColorMap(batches), [batches]);
  const filteredJobs = useMemo(() => {
    const jobs = detailQuery.data?.jobs ?? [];
    if (jobsBatchFilter === ALL_BATCHES) return jobs;
    return jobs.filter((job) => job.batch_id === jobsBatchFilter);
  }, [detailQuery.data?.jobs, jobsBatchFilter]);

  const jobsPagination = useMemo(
    () => paginateItems(filteredJobs, jobsPage, JOBS_PAGE_SIZE),
    [filteredJobs, jobsPage],
  );

  const insertedRows = detailQuery.data?.group?.inserted ?? [];
  const insertedPagination = useMemo(
    () => paginateItems(insertedRows, insertedPage, INSERTED_PAGE_SIZE),
    [insertedRows, insertedPage],
  );

  const filteredOutRows = detailQuery.data?.group?.filtered_out ?? [];
  const filteredOutPagination = useMemo(
    () =>
      paginateItems(filteredOutRows, filteredOutPage, FILTERED_OUT_PAGE_SIZE),
    [filteredOutRows, filteredOutPage],
  );

  if (jobsPagination.page !== jobsPage) {
    setJobsPage(jobsPagination.page);
  }
  if (insertedPagination.page !== insertedPage) {
    setInsertedPage(insertedPagination.page);
  }
  if (filteredOutPagination.page !== filteredOutPage) {
    setFilteredOutPage(filteredOutPagination.page);
  }

  if (!isReady || !accessToken) return null;

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <IngestGroupsTableSkeleton />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.group) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:px-8 md:py-6">
        <p className="text-sm text-rose-600">
          {detailQuery.error?.message || "Group not found"}
        </p>
      </div>
    );
  }

  const { group, jobs } = detailQuery.data;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-10 px-4 py-4 md:gap-12 md:px-8 md:py-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/add-businesses?tab=groups" />}
        >
          <ArrowLeftIcon />
          Back to Groups
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{group.name}</h1>
          <IngestStatusBadge status={group.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {group.payload_count} uploaded · {group.filtered_out_count} filtered
          out · {insertedPagination.total} inserted · {batches?.length ?? 0}{" "}
          batches · {jobs?.length ?? 0} jobs
        </p>
      </div>

      <IngestBatchOutcomesChart
        batches={batches}
        filteredOutCount={group.filtered_out_count}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="gap-6"
      >
        <TabsList>
          <TabsTrigger value={GROUP_TABS.batches}>Batches</TabsTrigger>
          <TabsTrigger value={GROUP_TABS.filteredOut}>
            Filtered Out ({filteredOutPagination.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value={GROUP_TABS.batches}
          className="flex flex-col gap-10 md:gap-12"
        >
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Batches
            </h2>
            <IngestBatchesTable batches={batches} colorMap={colorMap} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Jobs
            </h2>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="jobs-batch-filter"
                className="text-sm text-muted-foreground"
              >
                Batch
              </label>
              <Select
                value={jobsBatchFilter}
                onValueChange={(value) => {
                  setJobsBatchFilter(value ?? ALL_BATCHES);
                  setJobsPage(1);
                }}
              >
                <SelectTrigger
                  id="jobs-batch-filter"
                  className="h-9 w-full max-w-md"
                >
                  <SelectValue placeholder="All">
                    {jobsBatchFilter === ALL_BATCHES
                      ? "All"
                      : String(jobsBatchFilter).slice(0, 8)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BATCHES}>All</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem
                      key={batch.id}
                      value={batch.id}
                      title={batch.id}
                    >
                      {String(batch.id).slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <IngestJobsTable jobs={jobsPagination.items} colorMap={colorMap} />
            <Pagination
              page={jobsPagination.page}
              totalPages={jobsPagination.totalPages}
              displayPage={jobsPagination.page}
              total={jobsPagination.total}
              onPrevious={() => setJobsPage((page) => Math.max(1, page - 1))}
              onNext={() =>
                setJobsPage((page) =>
                  Math.min(jobsPagination.totalPages || 1, page + 1),
                )
              }
            />
          </section>

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
              onPrevious={() =>
                setInsertedPage((page) => Math.max(1, page - 1))
              }
              onNext={() =>
                setInsertedPage((page) =>
                  Math.min(insertedPagination.totalPages || 1, page + 1),
                )
              }
            />
          </section>
        </TabsContent>

        <TabsContent
          value={GROUP_TABS.filteredOut}
          className="flex flex-col gap-3"
        >
          <IngestPayloadTable
            columns={FILTERED_OUT_COLUMNS}
            rows={filteredOutPagination.items}
            emptyMessage="No businesses were filtered out."
            getRowKey={(row, index) => row.placeId || row.title || index}
          />
          <Pagination
            page={filteredOutPagination.page}
            totalPages={filteredOutPagination.totalPages}
            displayPage={filteredOutPagination.page}
            total={filteredOutPagination.total}
            onPrevious={() =>
              setFilteredOutPage((page) => Math.max(1, page - 1))
            }
            onNext={() =>
              setFilteredOutPage((page) =>
                Math.min(filteredOutPagination.totalPages || 1, page + 1),
              )
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
