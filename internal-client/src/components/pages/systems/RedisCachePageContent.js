"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import RedisFlushConfirmDialog from "@/components/pages/systems/RedisFlushConfirmDialog";
import SystemsHealthCheckSection from "@/components/pages/systems/SystemsHealthCheckSection";

const CACHE_RESOURCES = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Admin dashboard stats cache.",
    queryKeys: [["dashboard-stats"], ["dashboard-contact-messages"]],
  },
  {
    id: "businesses",
    title: "Businesses",
    description: "Admin businesses list and related admin business caches.",
    queryKeys: [
      ["admin-businesses"],
      ["admin-businesses-with-emails"],
      ["admin-business"],
    ],
  },
  {
    id: "locations",
    title: "Locations",
    description: "Admin location aggregates, charts, and location lists.",
    queryKeys: [["admin-locations"]],
  },
  {
    id: "contact-messages",
    title: "Contact messages",
    description: "Inbox contact form message lists.",
    queryKeys: [["contact-messages"], ["dashboard-contact-messages"]],
  },
  {
    id: "claim-requests",
    title: "Claim requests",
    description: "Claim request inbox lists.",
    queryKeys: [["claim-requests"]],
  },
  {
    id: "listing-reports",
    title: "Listing reports",
    description: "Listing report inbox lists.",
    queryKeys: [["listing-reports"]],
  },
  {
    id: "reference",
    title: "Reference data",
    description: "Public cities, states, categories, and sitemap slug caches.",
    queryKeys: [],
  },
];

function formatError(error) {
  const message = error?.message;
  if (typeof message === "string") return message;
  return "Failed to invalidate cache";
}

export default function RedisCachePageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [actionError, setActionError] = useState(null);
  const [successResource, setSuccessResource] = useState(null);
  const [flushOpen, setFlushOpen] = useState(false);
  const [pendingResource, setPendingResource] = useState(null);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    if (!successResource) return undefined;
    const timer = window.setTimeout(() => setSuccessResource(null), 2500);
    return () => window.clearTimeout(timer);
  }, [successResource]);

  const invalidateMutation = useMutation({
    mutationFn: async (resource) => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(formatError(result.error));
      }

      return { resource, data: result.data };
    },
    onMutate: (resource) => {
      setPendingResource(resource);
      setActionError(null);
      setSuccessResource(null);
    },
    onSuccess: async ({ resource }) => {
      const entry = CACHE_RESOURCES.find((item) => item.id === resource);
      if (entry?.queryKeys?.length) {
        await Promise.all(
          entry.queryKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      } else if (resource === "all") {
        await queryClient.invalidateQueries();
      }

      setSuccessResource(resource);
      setFlushOpen(false);
    },
    onError: (err) => {
      setActionError(err.message || "Failed to invalidate cache");
      setFlushOpen(false);
    },
    onSettled: () => {
      setPendingResource(null);
    },
  });

  if (!isReady || !accessToken) {
    return null;
  }

  const isPending = invalidateMutation.isPending;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-4 md:gap-10 md:px-8 md:py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Redis</h1>
        <p className="text-sm text-muted-foreground">
          Invalidate Redis cache prefixes used by the admin app and public site.
        </p>
      </div>

      <SystemsHealthCheckSection
        checkId="redis"
        title="Redis connection"
        description="Pings Redis from the API to confirm the cache server is reachable."
      />

      {actionError ? (
        <p className="text-sm text-destructive">{actionError}</p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Scoped caches</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {CACHE_RESOURCES.map((resource) => {
            const resourcePending =
              isPending && pendingResource === resource.id;
            const justSucceeded = successResource === resource.id;

            return (
              <li
                key={resource.id}
                className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-background p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {resource.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  className="w-fit cursor-pointer rounded-full bg-sky-500 text-white hover:bg-sky-600 hover:scale-95"
                  onClick={() => invalidateMutation.mutate(resource.id)}
                >
                  {justSucceeded ? (
                    <CheckIcon />
                  ) : (
                    <RefreshCwIcon
                      className={resourcePending ? "animate-spin" : undefined}
                    />
                  )}
                  {resourcePending
                    ? "Clearing…"
                    : justSucceeded
                      ? "Cleared"
                      : "Clear cache"}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Danger zone</h2>
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Flush entire Redis database
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Removes every key in the current Redis DB. Use only when scoped
              clears are not enough.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            className="w-fit shrink-0 cursor-pointer rounded-full"
            onClick={() => {
              setActionError(null);
              setFlushOpen(true);
            }}
          >
            <Trash2Icon />
            Flush all
          </Button>
        </div>
      </section>

      <RedisFlushConfirmDialog
        open={flushOpen}
        onOpenChange={setFlushOpen}
        confirmPending={isPending && pendingResource === "all"}
        onConfirm={() => invalidateMutation.mutate("all")}
      />
    </div>
  );
}
