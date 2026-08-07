"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import PageFadeIn from "@/components/PageFadeIn";
import { Button } from "@/components/ui/button";
import BusinessActions from "@/components/pages/businesses/BusinessActions";
import BusinessesTable from "@/components/pages/businesses/BusinessesTable";
import BusinessesTableSkeleton from "@/components/pages/businesses/BusinessesTableSkeleton";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function buildTitle(location, kind) {
  if (!location) {
    if (kind === "state") return "State businesses";
    if (kind === "city") return "City businesses";
    return "Postal code businesses";
  }
  if (kind === "state") {
    return `${location.name} (${location.code})`;
  }
  if (kind === "city") {
    return location.state_code
      ? `${location.name}, ${location.state_code}`
      : location.name;
  }
  const place = [location.city_name, location.state_code]
    .filter(Boolean)
    .join(", ");
  return place ? `${location.code} · ${place}` : String(location.code);
}

function backHrefForKind(kind) {
  if (kind === "state") return "/locations?tab=states";
  if (kind === "city") return "/locations?tab=cities";
  return "/locations?tab=postal-codes";
}

function backLabelForKind(kind) {
  if (kind === "state") return "Back to states";
  if (kind === "city") return "Back to cities";
  return "Back to postal codes";
}

/**
 * @param {{ kind: "state" | "city" | "postal-code", param: string }} props
 */
export default function LocationBusinessesPageContent({ kind, param }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { q, page, setField } = useUrlQueryState({
    q: { type: "string", param: "q" },
    page: { type: "page" },
  });
  const [searchInput, setSearchInput] = useState(() => q || "");
  const [refreshError, setRefreshError] = useState(null);
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  const searchQuery = (q || "").trim();

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

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

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["admin-location-businesses", kind, param, page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) params.set("q", searchQuery);
      if (kind === "state") params.set("state_code", param);
      if (kind === "city") params.set("city_slug", param);
      if (kind === "postal-code") params.set("postal_code", param);

      const result = await fetchApi(`/admin/businesses?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.status === 404) {
        throw new Error(result.error?.message || "Location not found");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch businesses",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && Boolean(param),
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
        queryKey: ["admin-location-businesses", kind, param],
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
  const hasSearch = Boolean(searchQuery);
  const title = buildTitle(data?.location, kind);
  const total = data?.total ?? 0;

  return (
    <PageFadeIn className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href={backHrefForKind(kind)} />}
        >
          <ArrowLeftIcon />
          {backLabelForKind(kind)}
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {data?.location
              ? `${total.toLocaleString()} business${total === 1 ? "" : "es"}`
              : "Businesses in this location"}
          </p>
        </div>
      </div>

      <BusinessActions
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        onRefresh={() => refreshMutation.mutate()}
        refreshPending={refreshMutation.isPending || isFetching}
        refreshError={refreshError}
      />

      {error && !isFetching ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : null}

      {showInitialSkeleton ? (
        <BusinessesTableSkeleton />
      ) : !error || isPlaceholderData ? (
        <BusinessesTable
          businesses={businesses}
          activeTab="all"
          hasSearch={hasSearch}
        />
      ) : null}

      <Pagination
        page={page}
        totalPages={totalPages}
        displayPage={data?.page ?? page}
        total={data?.total}
        isFetching={isFetching}
        onPrevious={() => setField("page", Math.max(1, page - 1))}
        onNext={() => setField("page", page + 1)}
      />
    </PageFadeIn>
  );
}
