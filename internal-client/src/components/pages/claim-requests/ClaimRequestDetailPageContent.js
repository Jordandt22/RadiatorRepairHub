"use client";

import { useEffect, useMemo } from "react";
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
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";
import ClaimRequestDetailSkeleton from "@/components/pages/claim-requests/ClaimRequestDetailSkeleton";
import ClaimRequestStatusBadge from "@/components/pages/claim-requests/ClaimRequestStatusBadge";

function DetailCard({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function channelLabel(channel) {
  if (channel === "phone") return "Phone call";
  if (channel === "email") return "Email";
  return "—";
}

function contactUsed(claim) {
  if (claim?.contact) return claim.contact;
  if (claim?.channel === "email") return claim.business?.email || "—";
  if (claim?.channel === "phone") return claim.business?.phone || "—";
  return "—";
}

function actionLabel(action) {
  if (action === "start") return "Start";
  if (action === "resend") return "Resend";
  return action || "—";
}

function truncateText(value, max = 48) {
  if (!value || typeof value !== "string") return "—";
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function ConsentEventsTable({ events }) {
  if (!events.length) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No consent events recorded.
      </p>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Consent version</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>User agent</TableHead>
            <TableHead>Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="whitespace-nowrap">
                {actionLabel(event.action)}
              </TableCell>
              <TableCell className="max-w-[12rem]">
                <span
                  className="block truncate"
                  title={event.destination ?? undefined}
                >
                  {event.destination || "—"}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs">
                {event.consent_version || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs">
                {event.ip || "—"}
              </TableCell>
              <TableCell className="max-w-[14rem]">
                <span
                  className="block truncate text-xs text-muted-foreground"
                  title={event.user_agent ?? undefined}
                >
                  {truncateText(event.user_agent)}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatFullDate(event.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ClaimRequestDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const claimRequestId = params?.claim_request_id;
  const { accessToken, isReady, logout } = useAuth();

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const { data, error, isLoading } = useQuery({
    queryKey: ["claim-request", claimRequestId],
    enabled: Boolean(isReady && accessToken && claimRequestId),
    queryFn: async () => {
      const result = await fetchApi(
        `/admin/claim-requests/${claimRequestId}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.status === 404) {
        throw new Error("Claim request not found");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load claim request",
        );
      }
      return result.data;
    },
    staleTime: 30_000,
  });

  const claim = data?.claim_request;
  const consentEvents = useMemo(
    () => data?.consent_events ?? [],
    [data?.consent_events],
  );
  const resendEvents = useMemo(
    () => consentEvents.filter((event) => event.action === "resend"),
    [consentEvents],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <ClaimRequestDetailSkeleton />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/claim-requests" />}
        >
          <ArrowLeftIcon />
          Back to Claim Requests
        </Button>
        <p className="text-sm text-destructive">
          {error?.message || "Claim request not found"}
        </p>
      </div>
    );
  }

  const contact = contactUsed(claim);

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-4 md:gap-10 md:px-8 md:py-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/claim-requests" />}
        >
          <ArrowLeftIcon />
          Back to Claim Requests
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight">
            {claim.business?.title ?? "Claim request"}
          </h1>
          <ClaimRequestStatusBadge status={claim.status} />
        </div>
        <p className="font-mono text-sm text-muted-foreground break-all">
          {claim.claim_request_id}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Summary</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCard label="Business">
            <BusinessTitleLink
              id={claim.business?.id ?? claim.business_id}
              title={claim.business?.title}
              showSlug={Boolean(claim.business?.slug)}
              slug={claim.business?.slug}
            />
          </DetailCard>
          <DetailCard label="Status">
            <ClaimRequestStatusBadge status={claim.status} />
          </DetailCard>
          <DetailCard label="Channel">
            {channelLabel(claim.channel)}
          </DetailCard>
          <DetailCard label="Contact used">
            <span className="break-all">{contact}</span>
          </DetailCard>
          <DetailCard label="Attempts">
            <span className="tabular-nums">{claim.attempts ?? 0}</span>
          </DetailCard>
          <DetailCard label="Resend count">
            <span className="tabular-nums">{claim.resend_count ?? 0}</span>
          </DetailCard>
          <DetailCard label="Created">
            {formatFullDate(claim.created_at)}
          </DetailCard>
          <DetailCard label="Last attempted">
            {formatFullDate(claim.last_attempted_at)}
          </DetailCard>
          {claim.completed_by || claim.completed_at ? (
            <>
              <DetailCard label="Completed by">
                <span className="break-all font-mono text-xs">
                  {claim.completed_by || "—"}
                </span>
              </DetailCard>
              <DetailCard label="Completed at">
                {formatFullDate(claim.completed_at)}
              </DetailCard>
            </>
          ) : null}
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">
          Consent audit
          <span className="ml-2 font-normal text-muted-foreground">
            ({consentEvents.length})
          </span>
        </h2>
        <ConsentEventsTable events={consentEvents} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">
          Resends
          <span className="ml-2 font-normal text-muted-foreground">
            ({claim.resend_count ?? resendEvents.length})
          </span>
        </h2>
        {resendEvents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No resend events recorded.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 rounded-lg border border-border divide-y divide-border">
            {resendEvents.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">Resend</p>
                  <p
                    className="truncate text-sm text-muted-foreground"
                    title={event.destination ?? undefined}
                  >
                    {event.destination || "—"}
                  </p>
                </div>
                <time className="shrink-0 text-sm text-muted-foreground">
                  {formatFullDate(event.created_at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
