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
import { useLoading } from "@/contexts/Loading.context";
import { debounce } from "@/lib/debounce";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import { ensureQueryParam } from "@/lib/urlQueryState";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import {
  deleteTestBusiness,
  deleteTestUser,
  fetchTestBusinesses,
  fetchTestUsers,
} from "@/lib/api/testing";
import TestingFilterTabs, {
  VALID_TABS,
} from "@/components/pages/testing/TestingFilterTabs";
import TestingActions from "@/components/pages/testing/TestingActions";
import TestingBusinessesTable from "@/components/pages/testing/TestingBusinessesTable";
import TestingUsersTable from "@/components/pages/testing/TestingUsersTable";
import TestingTableSkeleton from "@/components/pages/testing/TestingTableSkeleton";
import TestingDeleteConfirmDialog from "@/components/pages/testing/TestingDeleteConfirmDialog";
import CreateTestBusinessDialog from "@/components/pages/testing/CreateTestBusinessDialog";
import CreateTestUserDialog from "@/components/pages/testing/CreateTestUserDialog";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "businesses";
}

export default function TestingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const { q, page, setField, setFields } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
    },
    { pathname: "/testing" },
  );

  const [searchInput, setSearchInput] = useState(() => q || "");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  const searchQuery = (q || "").trim();
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "businesses", "/testing");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setActionError(null);
      setDeleteTarget(null);
      setCreateOpen(false);
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

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    setActionError(null);
    setDeleteTarget(null);
    setCreateOpen(false);
    setFields({ q: "", page: 1 }, { resetPage: false });
    setSearchInput("");
    replaceTab(nextTab, "/testing");
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setField("page", page + 1);
  };

  const businessesQuery = useQuery({
    queryKey: ["admin-testing-businesses", page, searchQuery],
    queryFn: async () => {
      const result = await fetchTestBusinesses({
        accessToken,
        page,
        limit: PAGE_LIMIT,
        q: searchQuery,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch test businesses");
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && activeTab === "businesses",
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-testing-users", page, searchQuery],
    queryFn: async () => {
      const result = await fetchTestUsers({
        accessToken,
        page,
        limit: PAGE_LIMIT,
        q: searchQuery,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch test users");
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && activeTab === "users",
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const activeQuery = activeTab === "users" ? usersQuery : businessesQuery;

  const deleteBusinessMutation = useMutation({
    mutationFn: async (id) => {
      const result = await deleteTestBusiness({ accessToken, id });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to delete test business");
      }
      return result.data;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-testing-businesses"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to delete test business");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (uid) => {
      const result = await deleteTestUser({ accessToken, uid });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to delete test user");
      }
      return result.data;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-testing-users"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to delete test user");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const key =
        activeTab === "users"
          ? ["admin-testing-users"]
          : ["admin-testing-businesses"];
      await queryClient.invalidateQueries({ queryKey: key });
    },
    onMutate: () => setRefreshError(null),
    onError: (err) => setRefreshError(err.message || "Failed to refresh"),
  });

  const deletePending =
    deleteBusinessMutation.isPending || deleteUserMutation.isPending;

  useEffect(() => {
    setLoading(deletePending);
  }, [deletePending, setLoading]);

  if (!isReady || !accessToken) {
    return null;
  }

  const businesses = businessesQuery.data?.businesses ?? [];
  const users = usersQuery.data?.users ?? [];
  const data = activeQuery.data;
  const error = activeQuery.error;
  const isLoading = activeQuery.isLoading;
  const isFetching = activeQuery.isFetching;
  const isPlaceholderData = activeQuery.isPlaceholderData;
  const totalPages = data?.totalPages ?? 0;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(searchQuery);

  const handleConfirmDelete = () => {
    if (!deleteTarget || deletePending) return;
    setActionError(null);
    if (activeTab === "users") {
      deleteUserMutation.mutate(deleteTarget.uid);
      return;
    }
    deleteBusinessMutation.mutate(deleteTarget.id);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <TestingFilterTabs value={activeTab} onValueChange={handleTabChange} />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <TestingActions
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          searchPlaceholder={
            activeTab === "users" ? "Search email or uid…" : "Search test businesses…"
          }
          createLabel={
            activeTab === "users" ? "Create Test User" : "Create Test Business"
          }
          onCreate={() => {
            setActionError(null);
            setCreateOpen(true);
          }}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          actionError={actionError}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <TestingTableSkeleton />
        ) : !error || isPlaceholderData ? (
          activeTab === "users" ? (
            <TestingUsersTable
              users={users}
              hasSearch={hasSearch}
              onDelete={(row) => {
                setActionError(null);
                setDeleteTarget(row);
              }}
              deletePending={deletePending}
            />
          ) : (
            <TestingBusinessesTable
              businesses={businesses}
              hasSearch={hasSearch}
              onDelete={(row) => {
                setActionError(null);
                setDeleteTarget(row);
              }}
              deletePending={deletePending}
            />
          )
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

      {activeTab === "users" ? (
        <CreateTestUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          accessToken={accessToken}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-testing-users"] });
          }}
        />
      ) : (
        <CreateTestBusinessDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          accessToken={accessToken}
          onCreated={() => {
            queryClient.invalidateQueries({
              queryKey: ["admin-testing-businesses"],
            });
          }}
        />
      )}

      <TestingDeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        title={activeTab === "users" ? "Delete test user?" : "Delete test business?"}
        description={
          activeTab === "users"
            ? "This permanently deletes the auth account, unclaims any owned listings, and cancels Featured subscriptions. Featured fees are non-refundable."
            : "This permanently deletes the test listing and related rows, cancels any Featured subscription, and clears listing caches. Featured fees are non-refundable."
        }
        confirmPending={deletePending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
