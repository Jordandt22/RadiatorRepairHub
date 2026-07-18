"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { useLoading } from "@/contexts/Loading.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import {
  replaceDashboardTab,
  subscribeToDashboardTab,
} from "@/lib/dashboardTab";
import StatusFilterTabs, {
  TAB_STATUS,
  VALID_TABS,
} from "@/components/pages/dashboard/StatusFilterTabs";
import BulkStatusActions from "@/components/pages/dashboard/BulkStatusActions";
import ContactMessagesTable from "@/components/pages/dashboard/ContactMessagesTable";
import ContactMessagesTableSkeleton from "@/components/pages/dashboard/ContactMessagesTableSkeleton";
import ContactMessageDrawer from "@/components/pages/dashboard/ContactMessageDrawer";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 30;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "all";
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  const statusFilter = TAB_STATUS[activeTab] ?? null;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      replaceDashboardTab("all");
      setActiveTab("all");
    }
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
      setPage(1);
    });
  }, []);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceDashboardTab(nextTab);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
    setSelectedIds(new Set());
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
    setSelectedIds(new Set());
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["contact-messages", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const result = await fetchApi(
        `/admin/contact-messages?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch messages");
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, contact_message_ids }) => {
      const result = await fetchApi("/admin/contact-messages/status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ status, contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to update status";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to update status");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "contact-messages" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setRefreshError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(statusMutation.isPending);
  }, [statusMutation.isPending, setLoading]);

  const debouncedStatusUpdateRef = useRef(null);

  useEffect(() => {
    debouncedStatusUpdateRef.current = debounce(
      ({ status, contact_message_ids, isPending, mutate }) => {
        if (contact_message_ids.length === 0 || isPending) {
          return;
        }
        setActionError(null);
        mutate({ status, contact_message_ids });
      },
      400,
    );
    return () => debouncedStatusUpdateRef.current?.cancel();
  }, []);

  const runStatusUpdate = (status) => {
    debouncedStatusUpdateRef.current?.({
      status,
      contact_message_ids: Array.from(selectedIds),
      isPending: statusMutation.isPending,
      mutate: statusMutation.mutate,
    });
  };

  if (!isReady || !accessToken) {
    return null;
  }

  const messages = data?.contactMessages ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const actionsDisabled = !hasSelection || statusMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;

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
      for (const message of messages) {
        if (checked) next.add(message.contact_message_id);
        else next.delete(message.contact_message_id);
      }
      return next;
    });
  };

  const handleViewClick = (message) => {
    setSelectedMessage(message);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto flex w-full px-8 flex-1 flex-col gap-4 px-3 py-6">
      <StatusFilterTabs value={activeTab} onValueChange={handleTabChange} />

      <div className="mt-4 flex flex-col gap-4">
        <BulkStatusActions
          selectedCount={selectedIds.size}
          disabled={actionsDisabled}
          actionError={actionError}
          onFlag={() => runStatusUpdate("flagged")}
          onApprove={() => runStatusUpdate("approved")}
          showFlag={activeTab !== "flagged" && activeTab !== "sent"}
          showApprove={activeTab !== "approved" && activeTab !== "sent"}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <ContactMessagesTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <ContactMessagesTable
            messages={messages}
            selectedIds={selectedIds}
            onToggleId={handleToggleId}
            onToggleAll={handleToggleAll}
            onViewClick={handleViewClick}
            activeTab={activeTab}
          />
        ) : null}

        <Pagination
          page={page}
          totalPages={totalPages}
          displayPage={data?.page ?? page}
          isFetching={isFetching}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </div>

      <ContactMessageDrawer
        message={selectedMessage}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
