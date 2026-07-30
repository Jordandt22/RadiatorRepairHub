"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import BusinessFilterTabs, {
  TAB_CLAIMED,
  VALID_TABS,
} from "@/components/pages/businesses/BusinessFilterTabs";
import BusinessActions from "@/components/pages/businesses/BusinessActions";
import BusinessesTable from "@/components/pages/businesses/BusinessesTable";
import BusinessesTableSkeleton from "@/components/pages/businesses/BusinessesTableSkeleton";
import BusinessDrawer from "@/components/pages/businesses/BusinessDrawer";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "all";
}

export default function BusinessesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [scoreTier, setScoreTier] = useState(null);
  const [reviewsTier, setReviewsTier] = useState(null);
  const [emailFilter, setEmailFilter] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const claimedFilter = TAB_CLAIMED[activeTab] ?? null;
  const searchQuery = debouncedSearch.trim();
  const scoreTierId = scoreTier?.id ?? null;
  const reviewsTierId = reviewsTier?.id ?? null;
  const emailFilterId = emailFilter?.id ?? null;
  const showTierFilters = activeTab === "all";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      window.history.replaceState(
        window.history.state,
        "",
        "/businesses?tab=all",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setPage(1);
      setScoreTier(null);
      setReviewsTier(null);
      setEmailFilter(null);
    });
  }, []);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
        setPage(1);
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
    setScoreTier(null);
    setReviewsTier(null);
    setEmailFilter(null);
    replaceTab(nextTab, "/businesses");
  };

  const handleScoreTierChange = (tier) => {
    setScoreTier(tier);
    setPage(1);
  };

  const handleReviewsTierChange = (tier) => {
    setReviewsTier(tier);
    setPage(1);
  };

  const handleEmailFilterChange = (filter) => {
    setEmailFilter(filter);
    setPage(1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
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
      if (claimedFilter === true) {
        params.set("claimed", "true");
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

  const businesses = useMemo(
    () => data?.businesses ?? [],
    [data?.businesses],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(
    searchQuery ||
      (showTierFilters &&
        (scoreTierId || reviewsTierId || emailFilterId)),
  );

  const handleViewClick = (business) => {
    setSelectedBusiness(business);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <BusinessFilterTabs value={activeTab} onValueChange={handleTabChange} />

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
            onViewClick={handleViewClick}
            activeTab={activeTab}
            hasSearch={hasSearch}
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

      <BusinessDrawer
        business={selectedBusiness}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
