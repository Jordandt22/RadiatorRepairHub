"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import EmailCleanerActions from "@/components/pages/email-cleaner/EmailCleanerActions";
import EmailCleanerConfirmDialog from "@/components/pages/email-cleaner/EmailCleanerConfirmDialog";
import EmailCleanerEditDialog from "@/components/pages/email-cleaner/EmailCleanerEditDialog";
import EmailCleanerTable from "@/components/pages/email-cleaner/EmailCleanerTable";
import EmailCleanerTableSkeleton from "@/components/pages/email-cleaner/EmailCleanerTableSkeleton";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function EmailCleanerPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editError, setEditError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  const searchQuery = debouncedSearch.trim();

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
        setPage(1);
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

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
    setSelectedIds(new Set());
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
    setSelectedIds(new Set());
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["admin-businesses-with-emails", page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) {
        params.set("q", searchQuery);
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
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

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
      clearEmailsMutation.isPending || updateEmailMutation.isPending,
    );
  }, [
    clearEmailsMutation.isPending,
    updateEmailMutation.isPending,
    setLoading,
  ]);

  const businesses = useMemo(
    () => data?.businesses ?? [],
    [data?.businesses],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const actionDisabled = !hasSelection || clearEmailsMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(searchQuery);

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

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteEmailsClick = () => {
    if (selectedIds.size === 0 || clearEmailsMutation.isPending) return;
    setActionError(null);
    setConfirmOpen(true);
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
        <EmailCleanerActions
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          selectedCount={selectedIds.size}
          actionDisabled={actionDisabled}
          onDeleteEmails={handleDeleteEmailsClick}
          onClearSelection={handleClearSelection}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          deletePending={clearEmailsMutation.isPending}
          actionError={actionError}
          refreshError={refreshError}
        />

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

      <EmailCleanerConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmDeleteEmails}
        confirmPending={clearEmailsMutation.isPending}
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
