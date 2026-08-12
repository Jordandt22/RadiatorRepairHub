"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
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
import IngestGroupsTableSkeleton from "@/components/pages/add-businesses/IngestGroupsTableSkeleton";

function isActive(status) {
  return ["pending", "running"].includes(status);
}

export default function ScrapeJobDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.["job_id"];
  const { accessToken, isReady, logout } = useAuth();

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["apify-scrape-job", jobId],
    enabled: Boolean(accessToken && jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (isActive(data.job?.status)) return 4000;
      return (data.cities ?? []).some((city) => isActive(city.status))
        ? 4000
        : false;
    },
    queryFn: async () => {
      const result = await fetchApi(`/admin/apify-scrape/jobs/${jobId}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load scrape");
      }
      return result.data;
    },
  });

  if (!isReady || !accessToken) return null;

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <IngestGroupsTableSkeleton />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.job) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:px-8 md:py-6">
        <p className="text-sm text-rose-600">
          {detailQuery.error?.message || "City scrape not found"}
        </p>
      </div>
    );
  }

  const { job, cities } = detailQuery.data;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-4 md:gap-10 md:px-8 md:py-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/add-businesses?tab=scraper" />}
        >
          <ArrowLeftIcon />
          Back to Scraper
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {job.search_keyword}
          </h1>
          <IngestStatusBadge status={job.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {job.city_count} cities · up to {job.max_places} places each ·{" "}
          {job.completed_cities} completed · {job.failed_cities} failed ·{" "}
          {formatDate(job.created_at)}
        </p>
      </div>

      <section className="flex min-w-0 flex-col gap-3 overflow-x-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cities
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Location</TableHead>
              <TableHead className="w-[14%]">Status</TableHead>
              <TableHead className="w-[12%]">Places</TableHead>
              <TableHead className="w-[24%]">Detail</TableHead>
              <TableHead className="w-[20%] text-right">Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">
                  {city.location_query}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <IngestStatusBadge status={city.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {city.place_count ?? 0}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {city.error_message ? (
                    <span className="text-rose-600">{city.error_message}</span>
                  ) : (
                    formatDate(city.completed_at || city.started_at) || "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {city.ingest_group_id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      nativeButton={false}
                      render={<Link href={`/group/${city.ingest_group_id}`} />}
                    >
                      View group
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
