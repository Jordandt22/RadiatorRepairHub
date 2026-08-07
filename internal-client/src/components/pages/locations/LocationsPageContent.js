"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
import PageFadeIn from "@/components/PageFadeIn";
import LocationFilterTabs, {
  VALID_TABS,
} from "@/components/pages/locations/LocationFilterTabs";
import LocationActions, {
  LOCATION_SORT_OPTIONS,
} from "@/components/pages/locations/LocationActions";
import LocationExportDialog from "@/components/pages/locations/LocationExportDialog";
import LocationsTable from "@/components/pages/locations/LocationsTable";
import LocationDataIssuesTable from "@/components/pages/locations/LocationDataIssuesTable";
import LocationsTableSkeleton from "@/components/pages/locations/LocationsTableSkeleton";
import LocationsBusinessesChart from "@/components/pages/locations/LocationsBusinessesChart";
import LocationsBusinessesChartSkeleton from "@/components/pages/locations/LocationsBusinessesChartSkeleton";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_SORT = LOCATION_SORT_OPTIONS[0].value;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "states";
}

function resolveSort(sort) {
  return LOCATION_SORT_OPTIONS.some((option) => option.value === sort)
    ? sort
    : DEFAULT_SORT;
}

export default function LocationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const {
    q,
    page,
    state: stateIdRaw,
    city: cityIdRaw,
    sort: sortRaw,
    setField,
    setFields,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      state: { type: "string", param: "state" },
      city: { type: "string", param: "city" },
      sort: {
        type: "string",
        param: "sort",
        defaultValue: DEFAULT_SORT,
      },
    },
    { pathname: "/locations" },
  );
  const [searchInput, setSearchInput] = useState(() => q || "");
  const [exportOpen, setExportOpen] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  const stateId = stateIdRaw || null;
  const cityId = cityIdRaw || null;
  const sort = resolveSort(sortRaw || DEFAULT_SORT);
  const searchQuery = (q || "").trim();
  const activeStateId =
    activeTab === "cities" || activeTab === "postal-codes" ? stateId : null;
  const activeCityId = activeTab === "postal-codes" ? cityId : null;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "states", "/locations");
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

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleStateChange = (state) => {
    if (activeTab === "postal-codes") {
      setFields({ state: state?.id ?? "", city: "", page: 1 });
    } else {
      setField("state", state?.id ?? "");
    }
  };

  const handleCityChange = (city) => {
    setField("city", city?.id ?? "");
  };

  const handleSortChange = (value) => {
    const nextSort = resolveSort(value);
    if (nextSort === sort) return;
    setField("sort", nextSort);
  };

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    setSearchInput("");
    setFields({
      q: "",
      state: "",
      city: "",
      page: 1,
    });
    replaceTab(nextTab, "/locations");
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setField("page", page + 1);
  };

  const { data: statesData } = useQuery({
    queryKey: ["admin-locations-states-options"],
    queryFn: async () => {
      const params = new URLSearchParams({
        tab: "states",
        page: "1",
        limit: "50",
      });
      const result = await fetchApi(`/admin/locations?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch states");
      }
      return result.data;
    },
    enabled:
      isReady &&
      !!accessToken &&
      (activeTab === "cities" || activeTab === "postal-codes"),
    staleTime: 5 * 60_000,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["admin-locations-cities-options"],
    queryFn: async () => {
      const params = new URLSearchParams({
        tab: "cities",
        page: "1",
        limit: "1000",
      });
      const result = await fetchApi(`/admin/locations?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch cities");
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && activeTab === "postal-codes",
    staleTime: 5 * 60_000,
  });

  const states = useMemo(() => {
    const list = statesData?.locations ?? [];
    return [...list].sort((a, b) =>
      String(a.name ?? "").localeCompare(String(b.name ?? "")),
    );
  }, [statesData?.locations]);

  const cities = useMemo(() => {
    const list = citiesData?.locations ?? [];
    const filtered = activeStateId
      ? list.filter((city) => city.state_id === activeStateId)
      : list;
    return [...filtered].sort((a, b) => {
      const byName = String(a.name ?? "").localeCompare(String(b.name ?? ""));
      if (byName !== 0) return byName;
      return String(a.state_code ?? "").localeCompare(String(b.state_code ?? ""));
    });
  }, [citiesData?.locations, activeStateId]);

  const selectedState = useMemo(
    () => states.find((state) => state.id === activeStateId) ?? null,
    [states, activeStateId],
  );

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === activeCityId) ?? null,
    [cities, activeCityId],
  );

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: [
      "admin-locations",
      page,
      activeTab,
      searchQuery,
      activeStateId,
      activeCityId,
      sort,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        tab: activeTab,
        page: String(page),
        limit: String(PAGE_LIMIT),
        sort,
      });
      if (searchQuery) {
        params.set("q", searchQuery);
      }
      if (activeStateId) {
        params.set("state_id", activeStateId);
      }
      if (activeCityId) {
        params.set("city_id", activeCityId);
      }

      const result = await fetchApi(`/admin/locations?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch locations",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: (previousData) =>
      previousData?.tab === activeTab ? previousData : undefined,
    staleTime: 30_000,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "locations" }),
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
      await queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-locations-states-options"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-locations-cities-options"],
      });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  const locations = useMemo(
    () => data?.locations ?? [],
    [data?.locations],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(searchQuery || activeStateId || activeCityId);
  const isDataIssuesTab = activeTab === "data-issues";

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <LocationFilterTabs value={activeTab} onValueChange={handleTabChange} />

      <PageFadeIn
        animationKey={activeTab}
        className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4"
      >
        <LocationActions
          activeTab={activeTab}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          sortValue={sort}
          onSortChange={handleSortChange}
          states={states}
          selectedState={selectedState}
          onStateChange={handleStateChange}
          cities={cities}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          onExportClick={() => setExportOpen(true)}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          refreshError={refreshError}
        />

        <LocationExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          mode={
            activeTab === "postal-codes"
              ? "postal-codes"
              : activeTab === "cities"
                ? "cities"
                : "states"
          }
          sort={sort}
          stateId={selectedState?.id ?? null}
          stateLabel={
            selectedState
              ? `${selectedState.name}${
                  selectedState.code ? ` (${selectedState.code})` : ""
                }`
              : null
          }
          cityId={selectedCity?.id ?? null}
          cityLabel={
            selectedCity
              ? `${selectedCity.name}${
                  selectedCity.state_code
                    ? ` (${selectedCity.state_code})`
                    : ""
                }`
              : null
          }
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <>
            {!isDataIssuesTab ? <LocationsBusinessesChartSkeleton /> : null}
            <LocationsTableSkeleton activeTab={activeTab} />
          </>
        ) : !error || isPlaceholderData ? (
          <>
            {!isDataIssuesTab ? (
              <LocationsBusinessesChart
                chart={data?.chart}
                activeTab={activeTab}
              />
            ) : null}
            {isDataIssuesTab ? (
              <LocationDataIssuesTable
                issues={locations}
                hasSearch={hasSearch}
              />
            ) : (
              <LocationsTable
                locations={locations}
                activeTab={activeTab}
                hasSearch={hasSearch}
              />
            )}
          </>
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
      </PageFadeIn>
    </div>
  );
}
