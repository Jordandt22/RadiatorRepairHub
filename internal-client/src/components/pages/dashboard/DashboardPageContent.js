"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import ContactMessagesTable, {
  EMAIL_SEND_SELECTION_CAP,
  hasBusinessEmail,
  hasContactEmail,
} from "@/components/pages/dashboard/ContactMessagesTable";
import ContactMessagesTableSkeleton from "@/components/pages/dashboard/ContactMessagesTableSkeleton";
import ContactMessageDrawer from "@/components/pages/dashboard/ContactMessageDrawer";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 10;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "pending";
}

export default function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading, showLoading, hideLoading } = useLoading();
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
  const archivedFilter = activeTab === "archived";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      // URL only — activeTab already defaults via resolveTab(null) => "pending"
      window.history.replaceState(
        window.history.state,
        "",
        "/dashboard?tab=pending",
      );
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
    queryKey: ["contact-messages", page, statusFilter, archivedFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        archived: String(archivedFilter),
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

  const archiveMutation = useMutation({
    mutationFn: async ({ archived, contact_message_ids }) => {
      const result = await fetchApi("/admin/contact-messages/archived", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ archived, contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to update archive status";
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
      setActionError(err.message || "Failed to update archive status");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi("/admin/contact-messages/confirmed", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to mark messages as confirmed";
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
      setActionError(err.message || "Failed to mark messages as confirmed");
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi("/admin/contact-messages/send", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to send messages";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      showLoading();
    },
    onSuccess: async () => {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to send messages");
    },
    onSettled: () => {
      hideLoading();
    },
  });

  const sendConfirmationsMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi(
        "/admin/contact-messages/send-confirmations",
        {
          method: "POST",
          accessToken,
          body: JSON.stringify({ contact_message_ids }),
        },
      );

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to send confirmation emails";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      showLoading();
    },
    onSuccess: async () => {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to send confirmation emails");
    },
    onSettled: () => {
      hideLoading();
    },
  });

  const sendDeclinedMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi("/admin/contact-messages/send-declined", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to send declined emails";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      showLoading();
    },
    onSuccess: async () => {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to send declined emails");
    },
    onSettled: () => {
      hideLoading();
    },
  });

  const markDeclinedMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi("/admin/contact-messages/declined", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to mark messages as declined";
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
      setActionError(err.message || "Failed to mark messages as declined");
    },
  });

  const markRespondedMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi("/admin/contact-messages/responded", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to mark messages as responded";
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
      setActionError(err.message || "Failed to mark messages as responded");
    },
  });

  const markNoResponseMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi("/admin/contact-messages/no-response", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to mark messages as no response";
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
      setActionError(err.message || "Failed to mark messages as no response");
    },
  });

  const sendNoResponseMutation = useMutation({
    mutationFn: async (contact_message_ids) => {
      const result = await fetchApi(
        "/admin/contact-messages/send-no-response",
        {
          method: "POST",
          accessToken,
          body: JSON.stringify({ contact_message_ids }),
        },
      );

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to send no-response emails";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      showLoading();
    },
    onSuccess: async () => {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to send no-response emails");
    },
    onSettled: () => {
      hideLoading();
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
    if (
      sendMutation.isPending ||
      sendConfirmationsMutation.isPending ||
      sendDeclinedMutation.isPending ||
      sendNoResponseMutation.isPending
    ) {
      return;
    }
    setLoading(
      statusMutation.isPending ||
        archiveMutation.isPending ||
        confirmMutation.isPending ||
        markDeclinedMutation.isPending ||
        markRespondedMutation.isPending ||
        markNoResponseMutation.isPending,
    );
  }, [
    statusMutation.isPending,
    archiveMutation.isPending,
    confirmMutation.isPending,
    markDeclinedMutation.isPending,
    markRespondedMutation.isPending,
    markNoResponseMutation.isPending,
    sendMutation.isPending,
    sendConfirmationsMutation.isPending,
    sendDeclinedMutation.isPending,
    sendNoResponseMutation.isPending,
    setLoading,
  ]);

  const debouncedStatusUpdateRef = useRef(null);
  const debouncedSendRef = useRef(null);
  const debouncedArchiveUpdateRef = useRef(null);
  const debouncedConfirmUpdateRef = useRef(null);

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

  useEffect(() => {
    debouncedSendRef.current = debounce(
      ({ contact_message_ids, isPending, mutate }) => {
        if (
          contact_message_ids.length === 0 ||
          contact_message_ids.length > EMAIL_SEND_SELECTION_CAP ||
          isPending
        ) {
          return;
        }
        mutate(contact_message_ids);
      },
      400,
    );
    return () => debouncedSendRef.current?.cancel();
  }, []);

  useEffect(() => {
    debouncedArchiveUpdateRef.current = debounce(
      ({ archived, contact_message_ids, isPending, mutate }) => {
        if (contact_message_ids.length === 0 || isPending) {
          return;
        }
        setActionError(null);
        mutate({ archived, contact_message_ids });
      },
      400,
    );
    return () => debouncedArchiveUpdateRef.current?.cancel();
  }, []);

  useEffect(() => {
    debouncedConfirmUpdateRef.current = debounce(
      ({ contact_message_ids, isPending, mutate }) => {
        if (contact_message_ids.length === 0 || isPending) {
          return;
        }
        setActionError(null);
        mutate(contact_message_ids);
      },
      400,
    );
    return () => debouncedConfirmUpdateRef.current?.cancel();
  }, []);

  const runStatusUpdate = (status) => {
    debouncedStatusUpdateRef.current?.({
      status,
      contact_message_ids: Array.from(selectedIds),
      isPending: statusMutation.isPending,
      mutate: statusMutation.mutate,
    });
  };

  const runSendMessages = () => {
    debouncedSendRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: sendMutation.isPending,
      mutate: sendMutation.mutate,
    });
  };

  const runArchiveUpdate = (archived) => {
    debouncedArchiveUpdateRef.current?.({
      archived,
      contact_message_ids: Array.from(selectedIds),
      isPending: archiveMutation.isPending,
      mutate: archiveMutation.mutate,
    });
  };

  const runMarkConfirmed = () => {
    debouncedConfirmUpdateRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: confirmMutation.isPending,
      mutate: confirmMutation.mutate,
    });
  };

  const runSendConfirmations = () => {
    debouncedSendRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: sendConfirmationsMutation.isPending,
      mutate: sendConfirmationsMutation.mutate,
    });
  };

  const runMarkDeclined = () => {
    debouncedConfirmUpdateRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: markDeclinedMutation.isPending,
      mutate: markDeclinedMutation.mutate,
    });
  };

  const runMarkResponded = () => {
    debouncedConfirmUpdateRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: markRespondedMutation.isPending,
      mutate: markRespondedMutation.mutate,
    });
  };

  const runSendDeclinedMessages = () => {
    debouncedSendRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: sendDeclinedMutation.isPending,
      mutate: sendDeclinedMutation.mutate,
    });
  };

  const runMarkNoResponse = () => {
    debouncedConfirmUpdateRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: markNoResponseMutation.isPending,
      mutate: markNoResponseMutation.mutate,
    });
  };

  const runSendNoResponse = () => {
    debouncedSendRef.current?.({
      contact_message_ids: Array.from(selectedIds),
      isPending: sendNoResponseMutation.isPending,
      mutate: sendNoResponseMutation.mutate,
    });
  };

  const messages = useMemo(
    () => data?.contactMessages ?? [],
    [data?.contactMessages],
  );

  const emailAvailableIdSet = useMemo(() => {
    if (activeTab !== "approved") return new Set();
    return new Set(
      messages
        .filter(hasBusinessEmail)
        .map((message) => message.contact_message_id),
    );
  }, [activeTab, messages]);

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const actionsDisabled =
    !hasSelection ||
    statusMutation.isPending ||
    sendMutation.isPending ||
    sendConfirmationsMutation.isPending ||
    sendDeclinedMutation.isPending ||
    sendNoResponseMutation.isPending ||
    markDeclinedMutation.isPending ||
    markRespondedMutation.isPending ||
    markNoResponseMutation.isPending ||
    archiveMutation.isPending ||
    confirmMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;

  const selectedIdList = Array.from(selectedIds);
  const allSelectedHaveEmail =
    selectedIdList.length > 0 &&
    selectedIdList.every((id) => emailAvailableIdSet.has(id));
  const canSendMessages =
    activeTab === "approved" &&
    allSelectedHaveEmail &&
    selectedIdList.length >= 1 &&
    selectedIdList.length <= EMAIL_SEND_SELECTION_CAP &&
    !sendMutation.isPending &&
    !sendConfirmationsMutation.isPending &&
    !statusMutation.isPending &&
    !archiveMutation.isPending &&
    !confirmMutation.isPending;

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

  const isArchivedTab = activeTab === "archived";
  const selectionIncludesStatus = (status) =>
    messages.some(
      (message) =>
        selectedIds.has(message.contact_message_id) &&
        message.status === status,
    );
  const selectionIncludesPending = selectionIncludesStatus("pending");
  const selectionIncludesFlagged = selectionIncludesStatus("flagged");
  const selectionIncludesApproved = selectionIncludesStatus("approved");
  const selectionIncludesConfirmed =
    activeTab === "sent" &&
    messages.some(
      (message) =>
        selectedIds.has(message.contact_message_id) &&
        Boolean(message.confirmation_sent),
    );
  const selectionIncludesUnconfirmed =
    activeTab === "sent" &&
    messages.some(
      (message) =>
        selectedIds.has(message.contact_message_id) &&
        !Boolean(message.confirmation_sent),
    );
  const selectionMissingContactEmail =
    activeTab === "sent" &&
    messages.some(
      (message) =>
        selectedIds.has(message.contact_message_id) &&
        !hasContactEmail(message),
    );
  const statusActionsDisabled = actionsDisabled;
  const flagDisabled = statusActionsDisabled || selectionIncludesFlagged;
  const markPendingDisabled =
    statusActionsDisabled || selectionIncludesPending;
  const approveDisabled = statusActionsDisabled || selectionIncludesApproved;
  const markConfirmedDisabled =
    actionsDisabled || selectionIncludesConfirmed;
  const sendConfirmationsDisabled =
    actionsDisabled ||
    selectionIncludesConfirmed ||
    selectionMissingContactEmail ||
    selectedIds.size > EMAIL_SEND_SELECTION_CAP;
  const outcomeRequiresConfirmedDisabled =
    actionsDisabled || selectionIncludesUnconfirmed;
  const markDeclinedDisabled = outcomeRequiresConfirmedDisabled;
  const markRespondedDisabled = outcomeRequiresConfirmedDisabled;
  const markNoResponseDisabled = outcomeRequiresConfirmedDisabled;
  const sendDeclinedMessagesDisabled =
    outcomeRequiresConfirmedDisabled ||
    selectionMissingContactEmail ||
    selectedIds.size > EMAIL_SEND_SELECTION_CAP;
  const sendNoResponseDisabled = sendDeclinedMessagesDisabled;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <StatusFilterTabs value={activeTab} onValueChange={handleTabChange} />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <BulkStatusActions
          selectedCount={selectedIds.size}
          disabled={statusActionsDisabled}
          flagDisabled={flagDisabled}
          markPendingDisabled={markPendingDisabled}
          approveDisabled={approveDisabled}
          actionError={actionError}
          onFlag={() => runStatusUpdate("flagged")}
          onApprove={() => runStatusUpdate("approved")}
          onMarkPending={() => runStatusUpdate("pending")}
          showFlag={
            !isArchivedTab &&
            activeTab !== "flagged" &&
            activeTab !== "sent" &&
            activeTab !== "result"
          }
          showApprove={
            !isArchivedTab &&
            activeTab !== "approved" &&
            activeTab !== "sent" &&
            activeTab !== "result"
          }
          showMarkPending={activeTab === "approved"}
          showMarkSent={activeTab === "approved"}
          showSendMessages={activeTab === "approved"}
          showConfirmedOutcome={activeTab === "sent"}
          showDeclinedOutcome={activeTab === "sent"}
          showNoResponseOutcome={activeTab === "sent"}
          showMarkResponded={activeTab === "sent"}
          showArchive={!isArchivedTab}
          showUnarchive={isArchivedTab}
          markSentDisabled={actionsDisabled}
          sendMessagesDisabled={!canSendMessages}
          markConfirmedDisabled={markConfirmedDisabled}
          sendConfirmationsDisabled={sendConfirmationsDisabled}
          markDeclinedDisabled={markDeclinedDisabled}
          sendDeclinedMessagesDisabled={sendDeclinedMessagesDisabled}
          markNoResponseDisabled={markNoResponseDisabled}
          sendNoResponseDisabled={sendNoResponseDisabled}
          markRespondedDisabled={markRespondedDisabled}
          archiveDisabled={actionsDisabled}
          unarchiveDisabled={actionsDisabled}
          onMarkSent={() => runStatusUpdate("sent")}
          onSendMessages={runSendMessages}
          onMarkConfirmed={runMarkConfirmed}
          onSendConfirmations={runSendConfirmations}
          onMarkDeclined={runMarkDeclined}
          onSendDeclinedMessages={runSendDeclinedMessages}
          onMarkNoResponse={runMarkNoResponse}
          onSendNoResponse={runSendNoResponse}
          onMarkResponded={runMarkResponded}
          onArchive={() => runArchiveUpdate(true)}
          onUnarchive={() => runArchiveUpdate(false)}
          sendPending={
            sendMutation.isPending ||
            sendConfirmationsMutation.isPending ||
            sendDeclinedMutation.isPending ||
            sendNoResponseMutation.isPending
          }
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
