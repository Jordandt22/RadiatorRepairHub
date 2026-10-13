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
import {
  PHONE_FILTERS,
  PHONE_LINE_TYPE_FILTERS,
  PHONE_STATUS_FILTERS,
} from "@/lib/businessTiers";
import PhoneNumbersFilterTabs, {
  VALID_TABS,
} from "@/components/pages/phone-numbers/PhoneNumbersFilterTabs";
import PhoneNumbersBusinessesActions from "@/components/pages/phone-numbers/PhoneNumbersBusinessesActions";
import PhoneNumbersBusinessesTable from "@/components/pages/phone-numbers/PhoneNumbersBusinessesTable";
import PhoneNumbersTableSkeleton from "@/components/pages/phone-numbers/PhoneNumbersTableSkeleton";
import BusinessExportDialog from "@/components/pages/businesses/BusinessExportDialog";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "businesses";
}

export default function PhoneNumbersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab"))
  );
  const [refreshError, setRefreshError] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const {
    q,
    page,
    phone: phoneFilter,
    status: phoneStatus,
    lineType: phoneLineType,
    setField,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      phone: {
        type: "option",
        param: "phone",
        options: PHONE_FILTERS,
      },
      status: {
        type: "option",
        param: "status",
        options: PHONE_STATUS_FILTERS,
      },
      lineType: {
        type: "option",
        param: "line_type",
        options: PHONE_LINE_TYPE_FILTERS,
      },
    },
    { pathname: "/phone-numbers" }
  );
  const [searchInput, setSearchInput] = useState(() => q || "");
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  const searchQuery = (q || "").trim();
  const phoneFilterId = phoneFilter?.id ?? null;
  const phoneStatusId = phoneStatus?.id ?? null;
  const phoneLineTypeId = phoneLineType?.id ?? null;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "businesses", "/phone-numbers");
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
    []
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceTab(nextTab, "/phone-numbers");
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setField("page", page + 1);
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: [
      "admin-phone-number-businesses",
      page,
      searchQuery,
      phoneFilterId,
      phoneStatusId,
      phoneLineTypeId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) params.set("q", searchQuery);
      if (phoneFilterId) params.set("phone_filter", phoneFilterId);
      if (phoneStatusId) params.set("phone_status", phoneStatusId);
      if (phoneLineTypeId) params.set("phone_line_type", phoneLineTypeId);

      const result = await fetchApi(`/admin/businesses?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch businesses");
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
        queryKey: ["admin-phone-number-businesses"],
      });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  const businesses = useMemo(
    () => data?.businesses ?? [],
    [data?.businesses]
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(
    searchQuery || phoneFilterId || phoneStatusId || phoneLineTypeId
  );

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <PhoneNumbersFilterTabs value={activeTab} onValueChange={handleTabChange} />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <PhoneNumbersBusinessesActions
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          phoneFilter={phoneFilter}
          onPhoneFilterChange={(value) => setField("phone", value)}
          phoneStatus={phoneStatus}
          onPhoneStatusChange={(value) => setField("status", value)}
          phoneLineType={phoneLineType}
          onPhoneLineTypeChange={(value) => setField("lineType", value)}
          onExportClick={() => setExportOpen(true)}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <PhoneNumbersTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <PhoneNumbersBusinessesTable
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

      <BusinessExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        source="phone-numbers"
        filters={{
          q: searchQuery || null,
          phoneFilter: phoneFilterId,
          phoneStatus: phoneStatusId,
          phoneLineType: phoneLineTypeId,
        }}
      />
    </div>
  );
}
