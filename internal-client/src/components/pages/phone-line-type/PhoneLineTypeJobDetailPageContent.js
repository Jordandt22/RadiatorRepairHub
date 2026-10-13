"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import IngestCountBadge from "@/components/pages/add-businesses/IngestCountBadge";
import PhoneLineTypeStatusBadge from "@/components/pages/phone-line-type/PhoneLineTypeStatusBadge";
import PhoneLineTypeTableSkeleton from "@/components/pages/phone-line-type/PhoneLineTypeTableSkeleton";

function isActiveJob(status) {
  return ["pending", "running"].includes(status);
}

export default function PhoneLineTypeJobDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.job_id;
  const { accessToken, isReady, logout } = useAuth();

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const detailQuery = useQuery({
    queryKey: ["phone-line-type-job", jobId],
    enabled: Boolean(accessToken && jobId),
    refetchInterval: (query) =>
      isActiveJob(query.state.data?.job?.status) ? 3000 : false,
    queryFn: async () => {
      const result = await fetchApi(`/admin/phone-line-type/jobs/${jobId}`, {
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

  if (!isReady || !accessToken) return null;

  const job = detailQuery.data?.job;

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <PhoneLineTypeTableSkeleton />
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
          render={<Link href="/phone-line-type" />}
        >
          <ArrowLeftIcon />
          Back to jobs
        </Button>
        <p className="text-sm text-destructive">
          {detailQuery.error?.message || "Phone line type job not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:gap-5 md:px-8 md:py-6">
      <Button
        variant="outline"
        size="sm"
        className="w-fit cursor-pointer"
        nativeButton={false}
        render={<Link href="/phone-line-type" />}
      >
        <ArrowLeftIcon />
        Back to jobs
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          Line type job
        </h1>
        <PhoneLineTypeStatusBadge status={job.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>Created {formatDate(job.created_at)}</span>
        {job.started_at ? <span>Started {formatDate(job.started_at)}</span> : null}
        {job.completed_at ? (
          <span>Completed {formatDate(job.completed_at)}</span>
        ) : null}
        {job.failed_at ? <span>Failed {formatDate(job.failed_at)}</span> : null}
      </div>

      {job.error_message ? (
        <p className="text-sm text-destructive">{job.error_message}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CountCard label="Limit" value={job.limit_count ?? 0} />
        <CountCard label="Selected" value={job.selected_count ?? 0} />
        <CountCard
          label="Succeeded"
          value={job.succeeded_count ?? 0}
          tone="success"
        />
        <CountCard label="Failed" value={job.failed_count ?? 0} tone="danger" />
        <CountCard label="Skipped" value={job.skipped_count ?? 0} />
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Uncached lookups are limited to 5 per second. If Twilio returns a rate
        limit, the rest of the run is left unchecked. Invalid numbers and other
        failed lookups are marked checked with an empty type so they are not
        selected again.
      </p>
    </div>
  );
}

function CountCard({ label, value, tone }) {
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2">
        <IngestCountBadge count={value} tone={tone} />
      </div>
    </div>
  );
}
