"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { useLoading } from "@/contexts/Loading.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import Pagination from "@/components/pages/dashboard/Pagination";
import AffiliateProgramsFilterTabs, {
  VALID_AFFILIATE_TABS,
} from "@/components/pages/affiliate-programs/AffiliateProgramsFilterTabs";
import AffiliateProgramsActions from "@/components/pages/affiliate-programs/AffiliateProgramsActions";
import AffiliateProductsTable from "@/components/pages/affiliate-programs/AffiliateProductsTable";
import AffiliateProductsTableSkeleton from "@/components/pages/affiliate-programs/AffiliateProductsTableSkeleton";
import AffiliateProductAddDialog from "@/components/pages/affiliate-programs/AffiliateProductAddDialog";

const PAGE_LIMIT = 10;

function resolveTab(tab) {
  return VALID_AFFILIATE_TABS.includes(tab) ? tab : "products";
}

export default function AffiliateProgramsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

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
        "/affiliate-programs?tab=products",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setPage(1);
      setSelectedIds(new Set());
    });
  }, []);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceTab(nextTab, "/affiliate-programs");
  };

  const { data, error, isLoading, isFetching, isPlaceholderData, refetch } =
    useQuery({
      queryKey: ["affiliate-products", page],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_LIMIT),
        });

        const result = await fetchApi(
          `/admin/affiliate-products?${params.toString()}`,
          { accessToken },
        );

        if (result.status === 401) {
          logout();
          throw new Error("Session expired. Please sign in again.");
        }

        if (result.error) {
          throw new Error(
            result.error.message || "Failed to load affiliate products.",
          );
        }

        return result.data;
      },
      enabled: isReady && Boolean(accessToken),
      placeholderData: keepPreviousData,
    });

  useEffect(() => {
    setLoading(isFetching && !isPlaceholderData);
  }, [isFetching, isPlaceholderData, setLoading]);

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const result = await fetchApi("/admin/affiliate-products", {
        method: "POST",
        accessToken,
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired. Please sign in again.");
      }

      if (result.error) {
        throw new Error(
          result.error.message || "Failed to create affiliate product.",
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setDialogOpen(false);
      setEditingProduct(null);
      await queryClient.invalidateQueries({ queryKey: ["affiliate-products"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to create affiliate product.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const result = await fetchApi("/admin/affiliate-products", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired. Please sign in again.");
      }

      if (result.error) {
        throw new Error(
          result.error.message || "Failed to update affiliate product.",
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setDialogOpen(false);
      setEditingProduct(null);
      await queryClient.invalidateQueries({ queryKey: ["affiliate-products"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to update affiliate product.");
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: async ({ affiliate_product_ids, is_active }) => {
      const result = await fetchApi("/admin/affiliate-products/active", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({
          affiliate_product_ids,
          is_active,
        }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired. Please sign in again.");
      }

      if (result.error) {
        throw new Error(
          result.error.message ||
            `Failed to ${is_active ? "activate" : "deactivate"} affiliate products.`,
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["affiliate-products"] });
    },
    onError: (err) => {
      setActionError(
        err.message || "Failed to update affiliate product status.",
      );
    },
  });

  const submitPending =
    createMutation.isPending || updateMutation.isPending;
  const hasSelection = selectedIds.size > 0;
  const setActivePending = setActiveMutation.isPending;
  const activateDisabled =
    !hasSelection || setActivePending || submitPending;
  const deactivateDisabled =
    !hasSelection || setActivePending || submitPending;

  const handleRefresh = async () => {
    setRefreshError(null);
    try {
      await refetch();
    } catch (err) {
      setRefreshError(err.message || "Failed to refresh products.");
    }
  };

  const openAddDialog = () => {
    setActionError(null);
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setActionError(null);
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open) => {
    if (submitPending) return;
    setDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
      setActionError(null);
    }
  };

  const handleSubmit = async (payload) => {
    setActionError(null);
    try {
      if (payload.id) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      return true;
    } catch {
      return false;
    }
  };

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? page;

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
      for (const row of products) {
        if (checked) next.add(row.id);
        else next.delete(row.id);
      }
      return next;
    });
  };

  const handleSetActive = (is_active) => {
    const affiliate_product_ids = Array.from(selectedIds);
    if (affiliate_product_ids.length === 0 || setActivePending) {
      return;
    }
    setActionError(null);
    setActiveMutation.mutate({ affiliate_product_ids, is_active });
  };

  const activeMutationError = editingProduct
    ? updateMutation.isError
      ? updateMutation.error?.message || actionError
      : null
    : createMutation.isError
      ? createMutation.error?.message || actionError
      : null;

  return (
    <div className="mx-auto flex w-full min-w-0 flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <AffiliateProgramsFilterTabs
          value={activeTab}
          onValueChange={handleTabChange}
        />
        <AffiliateProgramsActions
          onAdd={openAddDialog}
          onActivate={() => handleSetActive(true)}
          onDeactivate={() => handleSetActive(false)}
          onRefresh={handleRefresh}
          selectedCount={selectedIds.size}
          activateDisabled={activateDisabled}
          deactivateDisabled={deactivateDisabled}
          refreshPending={isFetching}
          addDisabled={submitPending || setActivePending}
          actionError={actionError}
          refreshError={refreshError}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          {error.message || "Failed to load affiliate products."}
        </p>
      ) : null}

      {isLoading && !data ? (
        <AffiliateProductsTableSkeleton />
      ) : (
        <AffiliateProductsTable
          products={products}
          selectedIds={selectedIds}
          onToggleId={handleToggleId}
          onToggleAll={handleToggleAll}
          onEditClick={openEditDialog}
        />
      )}

      {totalPages > 0 ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          displayPage={currentPage}
          total={data?.total ?? 0}
          isFetching={isFetching}
          onPrevious={() => {
            setSelectedIds(new Set());
            setPage((prev) => Math.max(1, prev - 1));
          }}
          onNext={() => {
            setSelectedIds(new Set());
            setPage((prev) => prev + 1);
          }}
        />
      ) : null}

      <AffiliateProductAddDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmit}
        product={editingProduct}
        submitPending={submitPending}
        submitError={activeMutationError}
      />
    </div>
  );
}
