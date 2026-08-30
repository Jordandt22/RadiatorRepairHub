"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";
import { fetchApi } from "@/lib/api/fetchApi";

const GALLERY_VARIANT = "w=800,fit=cover,f=auto,q=80";
const BUSINESS_COVER_PLACEHOLDER =
  "/assets/images/business-cover-placeholder.svg";
const CF_IMAGES_BASE =
  process.env.NEXT_PUBLIC_CF_IMAGES_BASE_URL?.replace(/\/+$/, "") ||
  "https://radiatorrepairhub.com/images";

function getCdnEnvFolder() {
  const explicit = process.env.NEXT_PUBLIC_CF_IMAGES_ENV?.trim();
  if (explicit) return explicit;
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

function isUsableRemoteUrl(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const { hostname, protocol } = new URL(trimmed);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return hostname !== "localhost" && hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}

function gallerySrc(image, businessId) {
  const isDefault =
    Boolean(image?.is_default) || image?.image_id === "listing-default";

  if (isDefault) {
    return isUsableRemoteUrl(image?.image_url) ? image.image_url.trim() : null;
  }

  if (!image?.image_id || !businessId) return null;
  return `${CF_IMAGES_BASE}/${getCdnEnvFolder()}/business/${businessId}/${image.image_id}/${GALLERY_VARIANT}`;
}

function GalleryPhoto({ src, className }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolved = src && !failed ? src : BUSINESS_COVER_PLACEHOLDER;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt=""
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (src && !failed) setFailed(true);
      }}
    />
  );
}

function CdnStoredBadge({ stored }) {
  if (stored) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-emerald-100 text-emerald-800"
      >
        Stored
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-700"
    >
      Not stored
    </Badge>
  );
}

function actionErrorMessage(error, fallback) {
  const message = error?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (message && typeof message === "object") {
    const first = Object.values(message).find(
      (value) => typeof value === "string" && value.trim()
    );
    if (first) return first;
  }
  return fallback;
}

export default function BusinessDetailImagesTab({
  data,
  accessToken,
  logout,
}) {
  const queryClient = useQueryClient();
  const businessId = data.id;
  const images = (
    Array.isArray(data.gallery_images)
      ? data.gallery_images
      : Array.isArray(data.business_images)
        ? data.business_images
        : []
  ).filter((image) => image?.image_id);
  const storedCount = Array.isArray(data.business_images)
    ? data.business_images.length
    : 0;
  const cdnStored = Boolean(data.cdn_stored);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteImage, setDeleteImage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const hideMutation = useMutation({
    mutationFn: async ({ imageId, isHidden }) => {
      const result = await fetchApi("/admin/businesses/images/hidden", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ businessId, imageId, isHidden }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          actionErrorMessage(result.error, "Failed to update this photo")
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setPreviewImage(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-business", businessId],
      });
    },
    onError: (error) => {
      setActionError(actionErrorMessage(error, "Failed to update this photo"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId) => {
      const result = await fetchApi("/admin/businesses/images", {
        method: "DELETE",
        accessToken,
        body: JSON.stringify({ businessId, imageId }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          actionErrorMessage(result.error, "Failed to delete this photo")
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setDeleteImage(null);
      setPreviewImage(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-business", businessId],
      });
    },
    onError: (error) => {
      setActionError(actionErrorMessage(error, "Failed to delete this photo"));
    },
  });

  const busy = hideMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">CDN status</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BusinessDetailCard label="CDN stored">
            <CdnStoredBadge stored={cdnStored} />
          </BusinessDetailCard>
          <BusinessDetailCard label="Upload attempts">
            {data.cdn_stored_attempts ?? 0}
          </BusinessDetailCard>
          <BusinessDetailCard label="Stored extras">
            {storedCount}
          </BusinessDetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Listing photos</h2>
        {actionError ? (
          <p className="text-sm text-destructive">{actionError}</p>
        ) : null}
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No listing photos for this business.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => {
              const src = gallerySrc(image, businessId);
              const canHide = !image.is_primary;
              const canDelete = !image.is_default && image.image_id !== "listing-default";
              return (
                <li
                  key={image.image_id}
                  className="overflow-hidden rounded-lg border border-border"
                >
                  <button
                    type="button"
                    className="group relative block w-full cursor-pointer bg-muted/30"
                    onClick={() => setPreviewImage(image)}
                  >
                    <GalleryPhoto
                      src={src}
                      className={`h-48 w-full object-cover ${
                        image.is_hidden ? "opacity-50" : ""
                      }`}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-[1] bg-black/0 transition-all duration-300 group-hover:bg-black/15 motion-reduce:transition-none"
                    />
                  </button>
                  <div className="flex flex-col gap-3 p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {image.is_primary ? (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-sky-100 text-sky-800"
                        >
                          Primary
                        </Badge>
                      ) : null}
                      {image.is_default ? (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-zinc-100 text-zinc-700"
                        >
                          Default
                        </Badge>
                      ) : null}
                      {image.is_hidden ? (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-amber-100 text-amber-800"
                        >
                          Hidden
                        </Badge>
                      ) : null}
                      {!image.is_hidden && image.visible === false ? (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-violet-100 text-violet-800"
                        >
                          Featured only
                        </Badge>
                      ) : null}
                    </div>
                    {image.created_at ? (
                      <p className="text-xs text-muted-foreground">
                        Added {formatFullDate(image.created_at)}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer rounded-full"
                        disabled={busy || !canHide}
                        onClick={() =>
                          hideMutation.mutate({
                            imageId: image.image_id,
                            isHidden: !image.is_hidden,
                          })
                        }
                      >
                        {image.is_hidden ? <Eye /> : <EyeOff />}
                        {image.is_hidden ? "Show" : "Hide"}
                      </Button>
                      {canDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer rounded-full"
                          disabled={busy}
                          onClick={() => setDeleteImage(image)}
                        >
                          <Trash2 />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review photo</DialogTitle>
            <DialogDescription>
              {previewImage?.is_default
                ? "Original listing photo. It can be hidden, but not deleted."
                : "Owner-uploaded listing photo."}
            </DialogDescription>
          </DialogHeader>
          {previewImage ? (
            <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
              <GalleryPhoto
                src={gallerySrc(previewImage, businessId)}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteImage)}
        onOpenChange={(open) => {
          if (deleteMutation.isPending) return;
          if (!open) setDeleteImage(null);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={!deleteMutation.isPending}
        >
          <DialogHeader>
            <DialogTitle>Delete photo?</DialogTitle>
            <DialogDescription>
              This permanently removes the photo from the listing and Cloudflare.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              className="cursor-pointer rounded-full"
              onClick={() => setDeleteImage(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || !deleteImage}
              className="cursor-pointer rounded-full"
              onClick={() => {
                if (!deleteImage?.image_id) return;
                deleteMutation.mutate(deleteImage.image_id);
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
