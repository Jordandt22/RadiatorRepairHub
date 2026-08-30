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
import {
  SCORE_TIERS,
  REVIEW_TIERS,
  EMAIL_FILTERS,
} from "@/lib/businessTiers";
import BusinessFilterTabs, {
  LISTING_TAB_FILTERS,
  VALID_LISTING_TABS,
  isManagedListingTab,
} from "@/components/pages/businesses/BusinessFilterTabs";
import BusinessActions from "@/components/pages/businesses/BusinessActions";
import BusinessesTable from "@/components/pages/businesses/BusinessesTable";
import BusinessesTableSkeleton from "@/components/pages/businesses/BusinessesTableSkeleton";
import ReverseClaimConfirmDialog from "@/components/pages/businesses/ReverseClaimConfirmDialog";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_LISTING_TABS.includes(tab) ? tab : "all";
}

export default function BusinessesPageContent() {
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
    score: scoreTier,
    reviews: reviewsTier,
    contact: emailFilter,
    setField,
    setFields,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      score: { type: "option", param: "score", options: SCORE_TIERS },
      reviews: { type: "option", param: "reviews", options: REVIEW_TIERS },
      contact: { type: "option", param: "contact", options: EMAIL_FILTERS },
    },
    { pathname: "/businesses" },
  );

  const [searchInput, setSearchInput] = useState(() => q || "");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  const claimedFilter = LISTING_TAB_FILTERS[activeTab]?.claimed ?? null;
  const featuredFilter = LISTING_TAB_FILTERS[activeTab]?.featured ?? null;
  const recentFilter = LISTING_TAB_FILTERS[activeTab]?.recent ?? null;
  const searchQuery = (q || "").trim();
  const scoreTierId = scoreTier?.id ?? null;
  const reviewsTierId = reviewsTier?.id ?? null;
  const emailFilterId = emailFilter?.id ?? null;
  const showTierFilters = activeTab === "all";
  const showReverseClaim = isManagedListingTab(activeTab);
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "all", "/businesses");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
      setActionError(null);
    });
  }, []);

  useEffect(() => {
    setSearchInput(q || "");
  }, [q]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setFieldRef.current("q", value);
        setSelectedIds(new Set());
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    setSelectedIds(new Set());
    setActionError(null);
    setFields(
      {
        q: "",
        page: 1,
        score: null,
        reviews: null,
        contact: null,
      },
      { resetPage: false },
    );
    setSearchInput("");
    replaceTab(nextTab, "/businesses");
  };

  const handleScoreTierChange = (tier) => {
    setField("score", tier);
  };

  const handleReviewsTierChange = (tier) => {
    setField("reviews", tier);
  };

  const handleEmailFilterChange = (filter) => {
    setField("contact", filter);
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
    setSelectedIds(new Set());
  };

  const handleNextPage = () => {
    setField("page", page + 1);
    setSelectedIds(new Set());
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: [
      "admin-businesses",
      page,
      activeTab,
      searchQuery,
      scoreTierId,
      reviewsTierId,
      emailFilterId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (recentFilter === true) {
        params.set("recent", "true");
      }
      if (claimedFilter === true) {
        params.set("claimed", "true");
      }
      if (featuredFilter === true) {
        params.set("featured", "true");
      }
      if (searchQuery) {
        params.set("q", searchQuery);
      }
      if (showTierFilters && scoreTierId) {
        params.set("score_tier", scoreTierId);
      }
      if (showTierFilters && reviewsTierId) {
        params.set("reviews_tier", reviewsTierId);
      }
      if (showTierFilters && emailFilterId) {
        params.set("email_filter", emailFilterId);
      }

      const result = await fetchApi(
        `/admin/businesses?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch businesses",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const unclaimMutation = useMutation({
    mutationFn: async (business_ids) => {
      const result = await fetchApi("/admin/businesses/unclaim", {
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
            : "Failed to reverse claims";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setConfirmOpen(false);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to reverse claims");
      setConfirmOpen(false);
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
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(unclaimMutation.isPending);
  }, [unclaimMutation.isPending, setLoading]);

  const businesses = useMemo(
    () => data?.businesses ?? [],
    [data?.businesses],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const reverseClaimDisabled = !hasSelection || unclaimMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(
    searchQuery ||
      (showTierFilters &&
        (scoreTierId || reviewsTierId || emailFilterId)),
  );

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

  const handleReverseClaimClick = () => {
    if (selectedIds.size === 0 || unclaimMutation.isPending) return;
    setActionError(null);
    setConfirmOpen(true);
  };

  const handleConfirmReverseClaim = () => {
    const business_ids = Array.from(selectedIds);
    if (business_ids.length === 0 || unclaimMutation.isPending) return;
    setActionError(null);
    unclaimMutation.mutate(business_ids);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <BusinessFilterTabs
        value={activeTab}
        onValueChange={handleTabChange}
        includeEdited
      />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <BusinessActions
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          showTierFilters={showTierFilters}
          scoreTier={scoreTier}
          onScoreTierChange={handleScoreTierChange}
          reviewsTier={reviewsTier}
          onReviewsTierChange={handleReviewsTierChange}
          emailFilter={emailFilter}
          onEmailFilterChange={handleEmailFilterChange}
          showReverseClaim={showReverseClaim}
          selectedCount={selectedIds.size}
          reverseClaimDisabled={reverseClaimDisabled}
          onReverseClaim={handleReverseClaimClick}
          reverseClaimPending={unclaimMutation.isPending}
          actionError={actionError}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <BusinessesTableSkeleton activeTab={activeTab} />
        ) : !error || isPlaceholderData ? (
          <BusinessesTable
            businesses={businesses}
            activeTab={activeTab}
            hasSearch={hasSearch}
            selectedIds={showReverseClaim ? selectedIds : undefined}
            onToggleId={showReverseClaim ? handleToggleId : undefined}
            onToggleAll={showReverseClaim ? handleToggleAll : undefined}
          />
        ) : null}

        <Pagination
          page={page}
          totalPages={totalPages}
          displayPage={data?.page ?? page}
          total={data?.total}
          isFetching={isFetching}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </div>

      <ReverseClaimConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmReverseClaim}
        confirmPending={unclaimMutation.isPending}
      />
    </div>
  );
}
