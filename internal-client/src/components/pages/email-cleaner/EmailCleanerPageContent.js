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
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import { ensureQueryParam } from "@/lib/urlQueryState";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import EmailCleanerActions, {
  EMAILS_SENT_FILTERS,
  SUSPICIOUS_FILTERS,
} from "@/components/pages/email-cleaner/EmailCleanerActions";
import EmailCleanerConfirmDialog from "@/components/pages/email-cleaner/EmailCleanerConfirmDialog";
import EmailCleanerEditDialog from "@/components/pages/email-cleaner/EmailCleanerEditDialog";
import EmailCleanerFilterTabs, {
  VALID_TABS,
} from "@/components/pages/email-cleaner/EmailCleanerFilterTabs";
import EmailCleanerFiltersDialog from "@/components/pages/email-cleaner/EmailCleanerFiltersDialog";
import EmailCleanerMarkStatusDialog, {
  EMAIL_STATUS_OPTIONS,
} from "@/components/pages/email-cleaner/EmailCleanerMarkStatusDialog";
import EmailCleanerReviewActions, {
  HAS_EMAIL_FILTERS,
} from "@/components/pages/email-cleaner/EmailCleanerReviewActions";
import EmailCleanerReviewFiltersDialog from "@/components/pages/email-cleaner/EmailCleanerReviewFiltersDialog";
import EmailCleanerTable from "@/components/pages/email-cleaner/EmailCleanerTable";
import EmailCleanerTableSkeleton from "@/components/pages/email-cleaner/EmailCleanerTableSkeleton";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "cleaner";
}

function parseBoolFilter(item) {
  if (!item?.id) return null;
  if (item.id === "true") return true;
  if (item.id === "false") return false;
  return null;
}

async function fetchWithEmailsList({
  accessToken,
  logout,
  page,
  searchQuery,
  emailsSentValue,
  suspiciousValue,
  statusFilterId,
  requireEmail,
  hasEmailValue = null,
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_LIMIT),
    require_email: String(requireEmail),
  });
  if (searchQuery) {
    params.set("q", searchQuery);
  }
  if (emailsSentValue !== null) {
    params.set("emails_sent", String(emailsSentValue));
  }
  if (requireEmail && suspiciousValue !== null) {
    params.set("suspicious", String(suspiciousValue));
  }
  if (!requireEmail && hasEmailValue !== null) {
    params.set("has_email", String(hasEmailValue));
  }
  if (statusFilterId) {
    params.set("email_status", statusFilterId);
  }

  const result = await fetchApi(
    `/admin/businesses/with-emails?${params.toString()}`,
    { accessToken },
  );
  if (result.status === 401) {
    logout();
    throw new Error("Session expired");
  }
  if (result.error) {
    throw new Error(
      result.error.message || "Failed to fetch businesses with emails",
    );
  }
  return result.data;
}

export default function EmailCleanerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );

  const {
    q,
    page,
    sent: emailsSent,
    suspicious,
    status: statusFilter,
    setField,
    setFields,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      sent: { type: "option", param: "sent", options: EMAILS_SENT_FILTERS },
      suspicious: {
        type: "option",
        param: "suspicious",
        options: SUSPICIOUS_FILTERS,
      },
      status: {
        type: "option",
        param: "status",
        options: EMAIL_STATUS_OPTIONS,
      },
    },
    { pathname: "/email-cleaner" },
  );

  const {
    q: reviewQ,
    page: reviewPage,
    sent: reviewEmailsSent,
    hasEmail: reviewHasEmail,
    status: reviewStatusFilter,
    setField: setReviewField,
    setFields: setReviewFields,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "rq" },
      page: { type: "page", param: "rpage" },
      sent: { type: "option", param: "rsent", options: EMAILS_SENT_FILTERS },
      hasEmail: {
        type: "option",
        param: "rhas_email",
        options: HAS_EMAIL_FILTERS,
      },
      status: {
        type: "option",
        param: "rstatus",
        options: EMAIL_STATUS_OPTIONS,
      },
    },
    { pathname: "/email-cleaner", pageKey: "page" },
  );

  const [searchInput, setSearchInput] = useState(() => q || "");
  const [reviewSearchInput, setReviewSearchInput] = useState(
    () => reviewQ || "",
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reviewFiltersOpen, setReviewFiltersOpen] = useState(false);
  const [markStatusOpen, setMarkStatusOpen] = useState(false);
  const [markStatusError, setMarkStatusError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editError, setEditError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  const searchQuery = (q || "").trim();
  const reviewSearchQuery = (reviewQ || "").trim();
  const emailsSentValue = parseBoolFilter(emailsSent);
  const reviewEmailsSentValue = parseBoolFilter(reviewEmailsSent);
  const reviewHasEmailValue = parseBoolFilter(reviewHasEmail);
  const suspiciousValue = parseBoolFilter(suspicious);
  const statusFilterId = statusFilter?.id ?? null;
  const reviewStatusFilterId = reviewStatusFilter?.id ?? null;
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;
  const setReviewFieldRef = useRef(setReviewField);
  setReviewFieldRef.current = setReviewField;

  const isCleanerTab = activeTab === "cleaner";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "cleaner", "/email-cleaner");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
      setActionError(null);
      setRefreshError(null);
      setMarkStatusOpen(false);
      setFiltersOpen(false);
      setReviewFiltersOpen(false);
      setConfirmOpen(false);
    });
  }, []);

  useEffect(() => {
    setSearchInput(q || "");
  }, [q]);

  useEffect(() => {
    setReviewSearchInput(reviewQ || "");
  }, [reviewQ]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setFieldRef.current("q", value);
        setSelectedIds(new Set());
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  const debouncedSetReviewSearch = useMemo(
    () =>
      debounce((value) => {
        setReviewFieldRef.current("q", value);
        setSelectedIds(new Set());
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
      debouncedSetReviewSearch.cancel();
    };
  }, [debouncedSetSearch, debouncedSetReviewSearch]);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    setSelectedIds(new Set());
    setActionError(null);
    setRefreshError(null);
    setMarkStatusOpen(false);
    setFiltersOpen(false);
    setReviewFiltersOpen(false);
    setConfirmOpen(false);
    replaceTab(nextTab, "/email-cleaner");
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleReviewSearchChange = (value) => {
    setReviewSearchInput(value);
    debouncedSetReviewSearch(value);
  };

  const handleApplyFilters = ({
    sent,
    suspicious: nextSuspicious,
    status,
  }) => {
    setFields({
      sent,
      suspicious: nextSuspicious,
      status,
      page: 1,
    });
    setSelectedIds(new Set());
  };

  const handleApplyReviewFilters = ({
    sent,
    hasEmail,
    status,
  }) => {
    setReviewFields({
      sent,
      hasEmail,
      status,
      page: 1,
    });
    setSelectedIds(new Set());
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
    setSelectedIds(new Set());
  };

  const handleNextPage = () => {
    setField("page", page + 1);
    setSelectedIds(new Set());
  };

  const handleReviewPreviousPage = () => {
    setReviewField("page", Math.max(1, reviewPage - 1));
    setSelectedIds(new Set());
  };

  const handleReviewNextPage = () => {
    setReviewField("page", reviewPage + 1);
    setSelectedIds(new Set());
  };

  const cleanerQuery = useQuery({
    queryKey: [
      "admin-businesses-with-emails",
      true,
      page,
      searchQuery,
      emailsSentValue,
      suspiciousValue,
      statusFilterId,
    ],
    queryFn: () =>
      fetchWithEmailsList({
        accessToken,
        logout,
        page,
        searchQuery,
        emailsSentValue,
        suspiciousValue,
        statusFilterId,
        requireEmail: true,
      }),
    enabled: isReady && !!accessToken && isCleanerTab,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const reviewQuery = useQuery({
    queryKey: [
      "admin-businesses-with-emails",
      false,
      reviewPage,
      reviewSearchQuery,
      reviewEmailsSentValue,
      reviewHasEmailValue,
      reviewStatusFilterId,
    ],
    queryFn: () =>
      fetchWithEmailsList({
        accessToken,
        logout,
        page: reviewPage,
        searchQuery: reviewSearchQuery,
        emailsSentValue: reviewEmailsSentValue,
        suspiciousValue: null,
        statusFilterId: reviewStatusFilterId,
        requireEmail: false,
        hasEmailValue: reviewHasEmailValue,
      }),
    enabled: isReady && !!accessToken && !isCleanerTab,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const activeQuery = isCleanerTab ? cleanerQuery : reviewQuery;
  const {
    data,
    error,
    isLoading,
    isFetching,
    isPlaceholderData,
  } = activeQuery;

  const clearEmailsMutation = useMutation({
    mutationFn: async (business_ids) => {
      const result = await fetchApi("/admin/businesses/clear-emails", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ business_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to clear emails";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setConfirmOpen(false);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-emails"],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to clear emails");
      setConfirmOpen(false);
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async ({ business_id, email }) => {
      const result = await fetchApi("/admin/businesses/email", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ business_id, email }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : typeof result.error.message?.email === "string"
              ? result.error.message.email
              : "Failed to update email";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setEditError(null);
      setEditOpen(false);
      setEditingBusiness(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-emails"],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setEditError(err.message || "Failed to update email");
    },
  });

  const markStatusMutation = useMutation({
    mutationFn: async (email_status) => {
      const result = await fetchApi("/admin/businesses/email-status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({
          business_ids: Array.from(selectedIds),
          email_status,
        }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(result.error.message || "Failed to mark status");
      }

      return result.data;
    },
    onMutate: () => {
      setMarkStatusError(null);
      setActionError(null);
    },
    onSuccess: async () => {
      setMarkStatusOpen(false);
      setSelectedIds(new Set());
      setMarkStatusError(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-emails"],
      });
    },
    onError: (err) => {
      setMarkStatusError(err.message || "Failed to mark status");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "businesses" }),
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
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-emails"],
      });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(
      clearEmailsMutation.isPending ||
        updateEmailMutation.isPending ||
        markStatusMutation.isPending,
    );
  }, [
    clearEmailsMutation.isPending,
    updateEmailMutation.isPending,
    markStatusMutation.isPending,
    setLoading,
  ]);

  const businesses = useMemo(
    () => data?.businesses ?? [],
    [data?.businesses],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const currentPage = isCleanerTab ? page : reviewPage;
  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const actionDisabled = !hasSelection || clearEmailsMutation.isPending;
  const markStatusDisabled =
    !hasSelection ||
    clearEmailsMutation.isPending ||
    markStatusMutation.isPending;
  const suspiciousOnPage = businesses.filter(
    (row) => (row.suspicion_reasons ?? []).length > 0,
  );
  const selectSuspiciousDisabled =
    suspiciousOnPage.length === 0 ||
    clearEmailsMutation.isPending ||
    markStatusMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(isCleanerTab ? searchQuery : reviewSearchQuery);
  const hasFilters = isCleanerTab
    ? emailsSentValue !== null ||
      suspiciousValue !== null ||
      Boolean(statusFilterId)
    : reviewEmailsSentValue !== null ||
      reviewHasEmailValue !== null ||
      Boolean(reviewStatusFilterId);

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
      for (const row of businesses) {
        if (checked) next.add(row.id);
        else next.delete(row.id);
      }
      return next;
    });
  };

  const handleSelectSuspicious = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const row of suspiciousOnPage) {
        next.add(row.id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteEmailsClick = () => {
    if (selectedIds.size === 0 || clearEmailsMutation.isPending) return;
    setActionError(null);
    setConfirmOpen(true);
  };

  const handleMarkStatusClick = () => {
    if (selectedIds.size === 0 || markStatusMutation.isPending) return;
    setMarkStatusError(null);
    setActionError(null);
    setMarkStatusOpen(true);
  };

  const handleConfirmDeleteEmails = () => {
    const business_ids = Array.from(selectedIds);
    if (business_ids.length === 0 || clearEmailsMutation.isPending) return;
    setActionError(null);
    clearEmailsMutation.mutate(business_ids);
  };

  const handleEditClick = (business) => {
    setEditError(null);
    setEditingBusiness(business);
    setEditOpen(true);
  };

  const handleEditOpenChange = (open) => {
    if (updateEmailMutation.isPending) return;
    setEditOpen(open);
    if (!open) {
      setEditingBusiness(null);
      setEditError(null);
    }
  };

  const handleUpdateEmail = async ({ business_id, email }) => {
    setEditError(null);
    try {
      await updateEmailMutation.mutateAsync({ business_id, email });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <EmailCleanerFilterTabs
          value={activeTab}
          onValueChange={handleTabChange}
        />

        {isCleanerTab ? (
          <EmailCleanerActions
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            filtersActive={hasFilters}
            onOpenFilters={() => setFiltersOpen(true)}
            selectedCount={selectedIds.size}
            actionDisabled={actionDisabled}
            selectSuspiciousDisabled={selectSuspiciousDisabled}
            markStatusDisabled={markStatusDisabled}
            onDeleteEmails={handleDeleteEmailsClick}
            onSelectSuspicious={handleSelectSuspicious}
            onMarkStatus={handleMarkStatusClick}
            onClearSelection={handleClearSelection}
            onRefresh={() => refreshMutation.mutate()}
            refreshPending={refreshMutation.isPending || isFetching}
            deletePending={clearEmailsMutation.isPending}
            markStatusPending={markStatusMutation.isPending}
            actionError={actionError}
            refreshError={refreshError}
          />
        ) : (
          <EmailCleanerReviewActions
            searchValue={reviewSearchInput}
            onSearchChange={handleReviewSearchChange}
            filtersActive={hasFilters}
            onOpenFilters={() => setReviewFiltersOpen(true)}
            selectedCount={selectedIds.size}
            markStatusDisabled={markStatusDisabled}
            onMarkStatus={handleMarkStatusClick}
            onClearSelection={handleClearSelection}
            onRefresh={() => refreshMutation.mutate()}
            refreshPending={refreshMutation.isPending || isFetching}
            markStatusPending={markStatusMutation.isPending}
            actionError={actionError}
            refreshError={refreshError}
          />
        )}

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <EmailCleanerTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <EmailCleanerTable
            businesses={businesses}
            selectedIds={selectedIds}
            onToggleId={handleToggleId}
            onToggleAll={handleToggleAll}
            onEditClick={handleEditClick}
            hasSearch={hasSearch}
            hasFilters={hasFilters}
            showEdit={isCleanerTab}
            emptyVariant={isCleanerTab ? "cleaner" : "review"}
          />
        ) : null}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          displayPage={data?.page ?? currentPage}
          total={data?.total}
          isFetching={isFetching}
          onPrevious={
            isCleanerTab ? handlePreviousPage : handleReviewPreviousPage
          }
          onNext={isCleanerTab ? handleNextPage : handleReviewNextPage}
        />
      </div>

      <EmailCleanerConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmDeleteEmails}
        confirmPending={clearEmailsMutation.isPending}
      />

      <EmailCleanerFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        emailsSent={emailsSent}
        suspicious={suspicious}
        statusFilter={statusFilter}
        onApply={handleApplyFilters}
      />

      <EmailCleanerReviewFiltersDialog
        open={reviewFiltersOpen}
        onOpenChange={setReviewFiltersOpen}
        emailsSent={reviewEmailsSent}
        hasEmail={reviewHasEmail}
        statusFilter={reviewStatusFilter}
        onApply={handleApplyReviewFilters}
      />

      <EmailCleanerMarkStatusDialog
        open={markStatusOpen}
        onOpenChange={(open) => {
          if (markStatusMutation.isPending) return;
          setMarkStatusOpen(open);
          if (!open) setMarkStatusError(null);
        }}
        selectedCount={selectedIds.size}
        onConfirm={(status) => markStatusMutation.mutate(status)}
        confirmPending={markStatusMutation.isPending}
        confirmError={markStatusError}
      />

      <EmailCleanerEditDialog
        open={editOpen}
        onOpenChange={handleEditOpenChange}
        business={editingBusiness}
        onSubmit={handleUpdateEmail}
        submitPending={updateEmailMutation.isPending}
        submitError={editError}
      />
    </div>
  );
}
