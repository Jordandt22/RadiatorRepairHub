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
import UsersActions from "@/components/pages/users/UsersActions";
import UsersDeleteConfirmDialog from "@/components/pages/users/UsersDeleteConfirmDialog";
import UsersTable from "@/components/pages/users/UsersTable";
import UsersTableSkeleton from "@/components/pages/users/UsersTableSkeleton";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;

export default function UsersPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
    setSelectedIds(new Set());
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
    setSelectedIds(new Set());
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });

      const result = await fetchApi(`/admin/users?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch users");
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (user_ids) => {
      const result = await fetchApi("/admin/users", {
        method: "DELETE",
        accessToken,
        body: JSON.stringify({ user_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to delete users";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setConfirmOpen(false);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to delete users");
      setConfirmOpen(false);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onMutate: () => {
      setRefreshError(null);
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(deleteMutation.isPending);
  }, [deleteMutation.isPending, setLoading]);

  const users = useMemo(() => data?.users ?? [], [data?.users]);

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const actionDisabled = !hasSelection || deleteMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;

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
      for (const row of users) {
        if (checked) next.add(row.uid);
        else next.delete(row.uid);
      }
      return next;
    });
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0 || deleteMutation.isPending) return;
    setActionError(null);
    setConfirmOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleConfirmDelete = () => {
    const user_ids = Array.from(selectedIds);
    if (user_ids.length === 0 || deleteMutation.isPending) return;
    setActionError(null);
    deleteMutation.mutate(user_ids);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <UsersActions
          selectedCount={selectedIds.size}
          actionDisabled={actionDisabled}
          onDelete={handleDeleteClick}
          onClearSelection={handleClearSelection}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          deletePending={deleteMutation.isPending}
          actionError={actionError}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <UsersTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <UsersTable
            users={users}
            selectedIds={selectedIds}
            onToggleId={handleToggleId}
            onToggleAll={handleToggleAll}
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

      <UsersDeleteConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmDelete}
        confirmPending={deleteMutation.isPending}
      />
    </div>
  );
}
