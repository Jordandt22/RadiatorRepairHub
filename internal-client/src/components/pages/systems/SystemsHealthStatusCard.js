"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react";

function statusBadgeClass(status) {
  if (status === "ok") {
    return "border-transparent bg-emerald-100 text-emerald-800";
  }
  if (status === "error") {
    return "border-transparent bg-red-100 text-red-800";
  }
  return "border-transparent bg-muted text-muted-foreground";
}

function statusLabel(status) {
  if (status === "ok") return "Healthy";
  if (status === "error") return "Down";
  return "Unknown";
}

export default function SystemsHealthStatusCard({
  title,
  description,
  check = null,
  isLoading = false,
  isFetching = false,
  error = null,
  onRefresh,
  externalUrl = null,
  externalLabel = "Open",
}) {
  const status = error ? "error" : check?.status;
  const latency =
    typeof check?.latency_ms === "number" ? `${check.latency_ms} ms` : null;
  const detailUrl =
    typeof check?.detail?.url === "string" ? check.detail.url : null;
  const message =
    error ||
    (typeof check?.message === "string" ? check.message : null) ||
    null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Health</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFetching}
          className="cursor-pointer rounded-full"
          onClick={onRefresh}
        >
          <RefreshCwIcon className={isFetching ? "animate-spin" : undefined} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {isLoading && !check ? (
            <Badge
              variant="outline"
              className="border-transparent bg-muted text-muted-foreground"
            >
              Checking…
            </Badge>
          ) : (
            <Badge variant="outline" className={statusBadgeClass(status)}>
              {statusLabel(status)}
            </Badge>
          )}
        </div>

        <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground/80">Latency</dt>
            <dd className="mt-0.5 tabular-nums">{latency || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground/80">Last checked</dt>
            <dd className="mt-0.5">
              {check?.checked_at
                ? new Date(check.checked_at).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>

        {message ? (
          <p className="text-sm text-destructive">{message}</p>
        ) : null}

        {externalUrl || detailUrl ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit cursor-pointer rounded-full"
            nativeButton={false}
            render={
              <a
                href={externalUrl || detailUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLinkIcon />
            {externalLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
