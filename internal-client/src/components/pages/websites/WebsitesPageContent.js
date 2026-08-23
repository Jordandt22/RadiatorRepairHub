"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import { ensureQueryParam } from "@/lib/urlQueryState";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import { WEBSITE_FILTERS } from "@/lib/businessTiers";
import WebsitesFilterTabs, {
  VALID_TABS,
} from "@/components/pages/websites/WebsitesFilterTabs";
import WebsitesBusinessesActions from "@/components/pages/websites/WebsitesBusinessesActions";
import WebsitesBusinessesTable from "@/components/pages/websites/WebsitesBusinessesTable";
import WebsitesTableSkeleton from "@/components/pages/websites/WebsitesTableSkeleton";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "businesses";
}

export default function WebsitesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [refreshError, setRefreshError] = useState(null);
  const {
    q,
    page,
    website: websiteFilter,
    setField,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      website: {
        type: "option",
        param: "website",
        options: WEBSITE_FILTERS,
      },
    },
    { pathname: "/websites" },
  );
  const [searchInput, setSearchInput] = useState(() => q || "");
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  const searchQuery = (q || "").trim();
  const websiteFilterId = websiteFilter?.id ?? null;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "businesses", "/websites");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
    });
  }, []);

  useEffect(() => {
    setSearchInput(q || "");
  }, [q]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setFieldRef.current("q", value);
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceTab(nextTab, "/websites");
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleWebsiteFilterChange = (value) => {
    setField("website", value);
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setField("page", page + 1);
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: [
      "admin-website-businesses",
      page,
      searchQuery,
      websiteFilterId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) {
        params.set("q", searchQuery);
      }
      if (websiteFilterId) {
        params.set("website_filter", websiteFilterId);
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
    enabled: isReady && !!accessToken && activeTab === "businesses",
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
      await queryClient.invalidateQueries({
        queryKey: ["admin-website-businesses"],
      });
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
  const hasSearch = Boolean(searchQuery || websiteFilterId);

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <WebsitesFilterTabs value={activeTab} onValueChange={handleTabChange} />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <WebsitesBusinessesActions
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          websiteFilter={websiteFilter}
          onWebsiteFilterChange={handleWebsiteFilterChange}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <WebsitesTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <WebsitesBusinessesTable
            businesses={businesses}
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
    </div>
  );
}
