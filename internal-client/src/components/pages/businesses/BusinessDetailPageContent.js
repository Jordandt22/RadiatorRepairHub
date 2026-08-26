"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessFeaturedBadge from "@/components/pages/businesses/BusinessFeaturedBadge";
import BusinessDetailAnalyticsTab from "@/components/pages/businesses/analytics/BusinessDetailAnalyticsTab";
import BusinessDetailEmailTab from "@/components/pages/businesses/BusinessDetailEmailTab";
import BusinessDetailImagesTab from "@/components/pages/businesses/BusinessDetailImagesTab";
import BusinessDetailListingTab from "@/components/pages/businesses/BusinessDetailListingTab";
import BusinessDetailLocationTab from "@/components/pages/businesses/BusinessDetailLocationTab";
import BusinessDetailSkeleton from "@/components/pages/businesses/BusinessDetailSkeleton";
import BusinessDetailTabs, {
  resolveBusinessDetailTab,
} from "@/components/pages/businesses/BusinessDetailTabs";
import BusinessListingCategoriesEditDialog from "@/components/pages/businesses/BusinessListingCategoriesEditDialog";
import BusinessListingEditDialog from "@/components/pages/businesses/BusinessListingEditDialog";
import BusinessSubscriptionsSection from "@/components/pages/businesses/BusinessSubscriptionsSection";

function formatListingError(error) {
  const message = error?.message;
  if (typeof message === "string") return message;
  if (message && typeof message === "object") {
    const first = Object.values(message).find(
      (value) => typeof value === "string" && value.trim()
    );
    if (first) return first;
  }
  return "Failed to update listing";
}

export default function BusinessDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [markStatusError, setMarkStatusError] = useState(null);
  const activeTab = resolveBusinessDetailTab(searchParams.get("tab"));

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const handleTabChange = (nextTab) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", nextTab);
    router.replace(`/businesses/${id}?${next.toString()}`, { scroll: false });
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["admin-business", id],
    enabled: Boolean(isReady && accessToken && id),
    queryFn: async () => {
      const result = await fetchApi(`/admin/businesses/${id}`, { accessToken });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.status === 404) {
        throw new Error("Business not found");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load business");
      }
      return result.data;
    },
    staleTime: 30_000,
  });

  const updateListingMutation = useMutation({
    mutationFn: async (payload) => {
      const result = await fetchApi("/admin/businesses/listing", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(formatListingError(result.error));
      }

      return result.data;
    },
    onSuccess: async () => {
      setEditError(null);
      setEditOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-business", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-emails"],
      });
    },
    onError: (err) => {
      setEditError(err.message || "Failed to update listing");
    },
  });

  const updateCategoriesMutation = useMutation({
    mutationFn: async (payload) => {
      const result = await fetchApi("/admin/businesses/categories", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(formatListingError(result.error));
      }

      return result.data;
    },
    onSuccess: async () => {
      setCategoriesError(null);
      setCategoriesOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-business", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (err) => {
      setCategoriesError(err.message || "Failed to update categories");
    },
  });

  const markStatusMutation = useMutation({
    mutationFn: async (email_status) => {
      const result = await fetchApi("/admin/businesses/email-status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({
          business_ids: [id],
          email_status,
        }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(result.error.message || "Failed to mark status");
      }

      return result.data;
    },
    onMutate: () => {
      setMarkStatusError(null);
    },
    onSuccess: async () => {
      setMarkStatusError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-business", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-businesses-with-emails"],
      });
    },
    onError: (err) => {
      setMarkStatusError(err.message || "Failed to mark status");
    },
  });

  if (!isReady || !accessToken) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <BusinessDetailSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/businesses?tab=all" />}
        >
          <ArrowLeftIcon />
          Back to Businesses
        </Button>
        <p className="text-sm text-destructive">
          {error?.message || "Business not found"}
        </p>
      </div>
    );
  }

  const publicUrl =
    data.slug && process.env.NEXT_PUBLIC_WEB_URL
      ? `${process.env.NEXT_PUBLIC_WEB_URL}/business/${data.slug}`
      : null;
  const isClaimed = Boolean(data.is_claimed);
  const isFeatured = Boolean(data.is_featured);
  const subscriptions = data.subscriptions ?? [];

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-4 md:gap-10 md:px-8 md:py-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/businesses?tab=all" />}
        >
          <ArrowLeftIcon />
          Back to Businesses
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight">
            {data.title ?? "Business"}
          </h1>
          <BusinessClaimedBadge isClaimed={isClaimed} />
          <BusinessFeaturedBadge isFeatured={isFeatured} />
        </div>
        {data.slug ? (
          <p className="text-sm text-muted-foreground">{data.slug}</p>
        ) : null}
        {publicUrl ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-fit cursor-pointer rounded-full"
            nativeButton={false}
            render={
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLinkIcon />
            View on site
          </Button>
        ) : null}
      </div>

      <BusinessDetailTabs value={activeTab} onValueChange={handleTabChange} />

      {activeTab === "listing" ? (
        <BusinessDetailListingTab
          data={data}
          onEdit={() => {
            setEditError(null);
            setEditOpen(true);
          }}
          onEditCategories={() => {
            setCategoriesError(null);
            setCategoriesOpen(true);
          }}
        />
      ) : null}

      {activeTab === "listing" ? (
        <BusinessSubscriptionsSection subscriptions={subscriptions} />
      ) : null}

      {activeTab === "email" ? (
        <BusinessDetailEmailTab
          business={data}
          accessToken={accessToken}
          logout={logout}
          markStatusPending={markStatusMutation.isPending}
          markStatusError={markStatusError}
          onMarkStatus={(emailStatus) =>
            markStatusMutation.mutateAsync(emailStatus)
          }
        />
      ) : null}

      {activeTab === "location" ? (
        <BusinessDetailLocationTab data={data} />
      ) : null}

      {activeTab === "images" ? (
        <BusinessDetailImagesTab data={data} />
      ) : null}

      {activeTab === "analytics" ? (
        <BusinessDetailAnalyticsTab
          business={data}
          accessToken={accessToken}
          logout={logout}
        />
      ) : null}

      <BusinessListingEditDialog
        open={editOpen}
        onOpenChange={(next) => {
          if (!next) setEditError(null);
          setEditOpen(next);
        }}
        business={data}
        submitPending={updateListingMutation.isPending}
        submitError={editError}
        onSubmit={async (payload) => {
          setEditError(null);
          await updateListingMutation.mutateAsync(payload);
        }}
      />

      <BusinessListingCategoriesEditDialog
        open={categoriesOpen}
        onOpenChange={(next) => {
          if (!next) setCategoriesError(null);
          setCategoriesOpen(next);
        }}
        business={data}
        accessToken={accessToken}
        logout={logout}
        submitPending={updateCategoriesMutation.isPending}
        submitError={categoriesError}
        onSubmit={async (payload) => {
          setCategoriesError(null);
          await updateCategoriesMutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
