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
import PhoneCleanerActions, {
  EMAILS_SENT_FILTERS,
  SUSPICIOUS_FILTERS,
} from "@/components/pages/phone-cleaner/PhoneCleanerActions";
import PhoneCleanerConfirmDialog from "@/components/pages/phone-cleaner/PhoneCleanerConfirmDialog";
import PhoneCleanerEditDialog from "@/components/pages/phone-cleaner/PhoneCleanerEditDialog";
import PhoneCleanerFilterTabs, {
  VALID_TABS,
} from "@/components/pages/phone-cleaner/PhoneCleanerFilterTabs";
import PhoneCleanerFiltersDialog from "@/components/pages/phone-cleaner/PhoneCleanerFiltersDialog";
import PhoneCleanerMarkStatusDialog, {
  PHONE_STATUS_OPTIONS,
} from "@/components/pages/phone-cleaner/PhoneCleanerMarkStatusDialog";
import PhoneCleanerReviewActions, {
  HAS_PHONE_FILTERS,
} from "@/components/pages/phone-cleaner/PhoneCleanerReviewActions";
import PhoneCleanerReviewFiltersDialog from "@/components/pages/phone-cleaner/PhoneCleanerReviewFiltersDialog";
import PhoneCleanerTable from "@/components/pages/phone-cleaner/PhoneCleanerTable";
import PhoneCleanerTableSkeleton from "@/components/pages/phone-cleaner/PhoneCleanerTableSkeleton";
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

async function fetchWithPhonesList({
  accessToken,
  logout,
  page,
  searchQuery,
  emailsSentValue,
  suspiciousValue,
  statusFilterId,
  requirePhone,
  hasPhoneValue = null,
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_LIMIT),
    require_phone: String(requirePhone),
  });
  if (searchQuery) {
    params.set("q", searchQuery);
  }
  if (emailsSentValue !== null) {
    params.set("emails_sent", String(emailsSentValue));
  }
  if (requirePhone && suspiciousValue !== null) {
    params.set("suspicious", String(suspiciousValue));
  }
  if (!requirePhone && hasPhoneValue !== null) {
    params.set("has_phone", String(hasPhoneValue));
  }
  if (statusFilterId) {
    params.set("phone_status", statusFilterId);
  }

  const result = await fetchApi(
    `/admin/businesses/with-phones?${params.toString()}`,
    { accessToken },
  );
  if (result.status === 401) {
    logout();
    throw new Error("Session expired");
  }
  if (result.error) {
    throw new Error(
      result.error.message || "Failed to fetch businesses with phones",
    );
  }
  return result.data;
}

export default function PhoneCleanerPageContent() {
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
        options: PHONE_STATUS_OPTIONS,
      },
    },
    { pathname: "/phone-cleaner" },
  );

  const {
    q: reviewQ,
    page: reviewPage,
    sent: reviewEmailsSent,
    hasPhone: reviewHasPhone,
    status: reviewStatusFilter,
    setField: setReviewField,
    setFields: setReviewFields,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "rq" },
      page: { type: "page", param: "rpage" },
      sent: { type: "option", param: "rsent", options: EMAILS_SENT_FILTERS },
      hasPhone: {
        type: "option",
        param: "rhas_phone",
        options: HAS_PHONE_FILTERS,
      },
      status: {
        type: "option",
        param: "rstatus",
        options: PHONE_STATUS_OPTIONS,
      },
    },
    { pathname: "/phone-cleaner", pageKey: "page" },
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
  const reviewHasPhoneValue = parseBoolFilter(reviewHasPhone);
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
    ensureQueryParam("tab", "cleaner", "/phone-cleaner");
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
    replaceTab(nextTab, "/phone-cleaner");
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
    hasPhone,
    status,
  }) => {
    setReviewFields({
      sent,
      hasPhone,
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
      "admin-businesses-with-phones",
      true,
      page,
      searchQuery,
      emailsSentValue,
      suspiciousValue,
      statusFilterId,
    ],
    queryFn: () =>
      fetchWithPhonesList({
        accessToken,
        logout,
        page,
        searchQuery,
        emailsSentValue,
        suspiciousValue,
        statusFilterId,
        requirePhone: true,
      }),
    enabled: isReady && !!accessToken && isCleanerTab,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const reviewQuery = useQuery({
    queryKey: [
      "admin-businesses-with-phones",
      false,
      reviewPage,
      reviewSearchQuery,
      reviewEmailsSentValue,
      reviewHasPhoneValue,
      reviewStatusFilterId,
    ],
    queryFn: () =>
      fetchWithPhonesList({
        accessToken,
        logout,
        page: reviewPage,
        searchQuery: reviewSearchQuery,
        emailsSentValue: reviewEmailsSentValue,
        suspiciousValue: null,
        statusFilterId: reviewStatusFilterId,
        requirePhone: false,
        hasPhoneValue: reviewHasPhoneValue,
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

  const clearPhonesMutation = useMutation({
    mutationFn: async (business_ids) => {
      const result = await fetchApi("/admin/businesses/clear-phones", {
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
            : "Failed to clear phones";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setConfirmOpen(false);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-phones"],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to clear phones");
      setConfirmOpen(false);
    },
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async ({ business_id, phone }) => {
      const result = await fetchApi("/admin/businesses/phone", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ business_id, phone }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : typeof result.error.message?.phone === "string"
              ? result.error.message.phone
              : "Failed to update phone";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setEditError(null);
      setEditOpen(false);
      setEditingBusiness(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-phones"],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setEditError(err.message || "Failed to update phone");
    },
  });

  const markStatusMutation = useMutation({
    mutationFn: async (phone_status) => {
      const result = await fetchApi("/admin/businesses/phone-status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({
          business_ids: Array.from(selectedIds),
          phone_status,
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
        queryKey: ["admin-businesses-with-phones"],
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
        queryKey: ["admin-businesses-with-phones"],
      });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(
      clearPhonesMutation.isPending ||
        updatePhoneMutation.isPending ||
        markStatusMutation.isPending,
    );
  }, [
    clearPhonesMutation.isPending,
    updatePhoneMutation.isPending,
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
  const actionDisabled = !hasSelection || clearPhonesMutation.isPending;
  const markStatusDisabled =
    !hasSelection ||
    clearPhonesMutation.isPending ||
    markStatusMutation.isPending;
  const suspiciousOnPage = businesses.filter(
    (row) => (row.suspicion_reasons ?? []).length > 0,
  );
  const selectSuspiciousDisabled =
    suspiciousOnPage.length === 0 ||
    clearPhonesMutation.isPending ||
    markStatusMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(isCleanerTab ? searchQuery : reviewSearchQuery);
  const hasFilters = isCleanerTab
    ? emailsSentValue !== null ||
      suspiciousValue !== null ||
      Boolean(statusFilterId)
    : reviewEmailsSentValue !== null ||
      reviewHasPhoneValue !== null ||
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

  const handleDeletePhonesClick = () => {
    if (selectedIds.size === 0 || clearPhonesMutation.isPending) return;
    setActionError(null);
    setConfirmOpen(true);
  };

  const handleMarkStatusClick = () => {
    if (selectedIds.size === 0 || markStatusMutation.isPending) return;
    setMarkStatusError(null);
    setActionError(null);
    setMarkStatusOpen(true);
  };

  const handleConfirmDeletePhones = () => {
    const business_ids = Array.from(selectedIds);
    if (business_ids.length === 0 || clearPhonesMutation.isPending) return;
    setActionError(null);
    clearPhonesMutation.mutate(business_ids);
  };

  const handleEditClick = (business) => {
    setEditError(null);
    setEditingBusiness(business);
    setEditOpen(true);
  };

  const handleEditOpenChange = (open) => {
    if (updatePhoneMutation.isPending) return;
    setEditOpen(open);
    if (!open) {
      setEditingBusiness(null);
      setEditError(null);
    }
  };

  const handleUpdatePhone = async ({ business_id, phone }) => {
    setEditError(null);
    try {
      await updatePhoneMutation.mutateAsync({ business_id, phone });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <PhoneCleanerFilterTabs
          value={activeTab}
          onValueChange={handleTabChange}
        />

        {isCleanerTab ? (
          <PhoneCleanerActions
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            filtersActive={hasFilters}
            onOpenFilters={() => setFiltersOpen(true)}
            selectedCount={selectedIds.size}
            actionDisabled={actionDisabled}
            selectSuspiciousDisabled={selectSuspiciousDisabled}
            markStatusDisabled={markStatusDisabled}
            onDeletePhones={handleDeletePhonesClick}
            onSelectSuspicious={handleSelectSuspicious}
            onMarkStatus={handleMarkStatusClick}
            onClearSelection={handleClearSelection}
            onRefresh={() => refreshMutation.mutate()}
            refreshPending={refreshMutation.isPending || isFetching}
            deletePending={clearPhonesMutation.isPending}
            markStatusPending={markStatusMutation.isPending}
            actionError={actionError}
            refreshError={refreshError}
          />
        ) : (
          <PhoneCleanerReviewActions
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
          <PhoneCleanerTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <PhoneCleanerTable
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

      <PhoneCleanerConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmDeletePhones}
        confirmPending={clearPhonesMutation.isPending}
      />

      <PhoneCleanerFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        emailsSent={emailsSent}
        suspicious={suspicious}
        statusFilter={statusFilter}
        onApply={handleApplyFilters}
      />

      <PhoneCleanerReviewFiltersDialog
        open={reviewFiltersOpen}
        onOpenChange={setReviewFiltersOpen}
        emailsSent={reviewEmailsSent}
        hasPhone={reviewHasPhone}
        statusFilter={reviewStatusFilter}
        onApply={handleApplyReviewFilters}
      />

      <PhoneCleanerMarkStatusDialog
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

      <PhoneCleanerEditDialog
        open={editOpen}
        onOpenChange={handleEditOpenChange}
        business={editingBusiness}
        onSubmit={handleUpdatePhone}
        submitPending={updatePhoneMutation.isPending}
        submitError={editError}
      />
    </div>
  );
}
