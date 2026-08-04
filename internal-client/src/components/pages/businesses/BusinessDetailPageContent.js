"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, ExternalLinkIcon, PencilIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessDetailSkeleton from "@/components/pages/businesses/BusinessDetailSkeleton";
import BusinessListingEditDialog from "@/components/pages/businesses/BusinessListingEditDialog";
import BusinessReviewsBadge from "@/components/pages/businesses/BusinessReviewsBadge";
import BusinessScoreBadge from "@/components/pages/businesses/BusinessScoreBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function DetailCard({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

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
  const id = params?.id;
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

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
  const hasOwner = Boolean(data.owner_uid);

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

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Listing</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={() => {
              setEditError(null);
              setEditOpen(true);
            }}
          >
            <PencilIcon />
            Edit
          </Button>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCard label="Title">{data.title || "—"}</DetailCard>
          <DetailCard label="Slug">{data.slug || "—"}</DetailCard>
          <DetailCard label="Address">{data.address || "—"}</DetailCard>
          <DetailCard label="Phone">{data.phone || "—"}</DetailCard>
          <DetailCard label="Email">
            {data.email ? (
              <a
                href={`mailto:${data.email}`}
                className="break-all underline underline-offset-2"
              >
                {data.email}
              </a>
            ) : (
              "—"
            )}
          </DetailCard>
          <DetailCard label="Website">
            {data.website ? (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline underline-offset-2"
              >
                {data.website}
              </a>
            ) : (
              "—"
            )}
          </DetailCard>
          <DetailCard label="Score">
            <BusinessScoreBadge score={data.total_score} />
          </DetailCard>
          <DetailCard label="Reviews">
            <BusinessReviewsBadge count={data.reviews_count} />
          </DetailCard>
          <DetailCard label="Claimed">
            <BusinessClaimedBadge isClaimed={isClaimed} />
          </DetailCard>
          <DetailCard label="Last edited">
            {formatFullDate(data.last_edited_at)}
          </DetailCard>
          <DetailCard label="Created">
            {formatFullDate(data.created_at)}
          </DetailCard>
          <DetailCard label="Place ID">
            {data.place_id ? (
              <span className="break-all font-mono text-xs">{data.place_id}</span>
            ) : (
              "—"
            )}
          </DetailCard>
          <DetailCard label="Business ID">
            <span className="break-all font-mono text-xs">{data.id}</span>
          </DetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Owner</h2>
        {isClaimed && hasOwner ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailCard label="Owner email">
              {data.owner_email ? (
                <Link
                  href={`/users/${data.owner_uid}`}
                  className="break-all underline underline-offset-2"
                >
                  {data.owner_email}
                </Link>
              ) : (
                <Link
                  href={`/users/${data.owner_uid}`}
                  className="underline underline-offset-2"
                >
                  View owner
                </Link>
              )}
            </DetailCard>
            <DetailCard label="Owner UID">
              <Link
                href={`/users/${data.owner_uid}`}
                className="break-all font-mono text-xs underline underline-offset-2"
              >
                {data.owner_uid}
              </Link>
            </DetailCard>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            This listing is not claimed.
          </p>
        )}
      </section>

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
    </div>
  );
}
