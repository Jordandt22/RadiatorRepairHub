"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Star,
  Trash2,
  Upload,
  XIcon,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { useToast } from "@/contexts/ToastProvider";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import OwnerEditButton from "@/components/businesses/OwnerEditButton";
import BusinessImage from "@/components/businesses/BusinessImage";
import { useIsBusinessOwner } from "@/hooks/useIsBusinessOwner";
import { captureOwnerListingUpdate } from "@/lib/analytics/ownerListing";
import {
  deleteOwnedBusinessImage,
  fetchOwnedBusinessImages,
  setOwnedBusinessImageHidden,
  setOwnedBusinessImagePrimary,
  uploadOwnedBusinessImage,
} from "@/lib/api/businessImages";
import {
  BUSINESS_GALLERY_IMAGE_SIZES,
  BUSINESS_LIGHTBOX_IMAGE_SIZES,
  CF_IMAGE_VARIANT,
} from "@/lib/images";

const DESKTOP_PAGE_SIZE = 2;
const OWNER_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const DEFAULT_IMAGE_KEY = "listing-default";

function orderGalleryImages(images) {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.length) return list;

  const primary = list.find((image) => image.is_primary);
  const hidden = list.filter((image) => image.is_hidden && image !== primary);
  const visibleRest = list.filter(
    (image) => image !== primary && !image.is_hidden
  );

  return primary
    ? [primary, ...visibleRest, ...hidden]
    : [...visibleRest, ...hidden];
}

function withDefaultListingImage(images, { imageUrl, hideDefaultImage = false } = {}) {
  const stored = (Array.isArray(images) ? images.filter(Boolean) : [])
    .filter(
      (image) =>
        image.image_id &&
        image.image_id !== DEFAULT_IMAGE_KEY &&
        !image.is_default
    )
    .map((image) => ({
      ...image,
      image_url: null,
      is_default: false,
    }));

  const combined = imageUrl && !hideDefaultImage
    ? [
      {
        image_id: DEFAULT_IMAGE_KEY,
        is_primary: !stored.some((image) => image.is_primary),
        visible: true,
        is_default: true,
        is_hidden: false,
        image_url: imageUrl,
      },
      ...stored,
    ]
    : stored;

  return orderGalleryImages(combined);
}

function PhotoBadges({ image, showHidden = false }) {
  return (
    <div className="pointer-events-none absolute top-2 left-2 z-10 flex max-w-[calc(100%-3.5rem)] flex-wrap gap-1">
      {image.is_default ? (
        <span className="inline-flex items-center rounded-full border border-border bg-card/95 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm">
          Default
        </span>
      ) : null}
      {image.is_primary ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
          <Star className="size-3 fill-current" aria-hidden="true" />
          Primary
        </span>
      ) : null}
      {showHidden && image.is_hidden ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-medium text-background shadow-sm">
          <EyeOff className="size-3" aria-hidden="true" />
          Hidden
        </span>
      ) : null}
    </div>
  );
}

function apiErrorMessage(error, fallback) {
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

function chunkItems(items, size) {
  const pages = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function getArrowState(el) {
  if (!el) return { canPrev: false, canNext: false };
  const maxScroll = el.scrollWidth - el.clientWidth;
  const left = el.scrollLeft;
  return {
    canPrev: left > 8,
    canNext: maxScroll > 8 && left < maxScroll - 8,
  };
}

function useTrackArrows(trackRef, itemCount) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const { canPrev: nextPrev, canNext: nextNext } = getArrowState(
      trackRef.current
    );
    setCanPrev(nextPrev);
    setCanNext(nextNext);
  }, [trackRef]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows, itemCount, trackRef]);

  return { canPrev, canNext };
}

function CarouselNavButtons({ canPrev, canNext, onPrev, onNext, className }) {
  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={!canPrev}
        aria-label="Previous photos"
        onClick={onPrev}
      >
        <ChevronLeft />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={!canNext}
        aria-label="Next photos"
        onClick={onNext}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

function PhotosCarousel({
  images,
  pageSize = 1,
  mobileOnly = false,
  desktopOnly = false,
  onSelect,
  onEditImage,
  businessId,
  businessName,
  cdnStored,
  variant,
  sizes,
  buttonClassName,
}) {
  const trackRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const pages = chunkItems(images, pageSize);
  const arrows = useTrackArrows(trackRef, pages.length);
  const showArrows = pages.length > 1;

  const scrollTrack = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const visibilityClass = mobileOnly
    ? "md:hidden"
    : desktopOnly
      ? "hidden md:block"
      : "";

  return (
    <div className={`relative max-w-full ${visibilityClass}`}>
      <div
        ref={trackRef}
        role="region"
        aria-label={`${businessName} photos`}
        aria-roledescription="carousel"
        className="flex max-w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, pageIndex) => (
          <div
            key={page.map((image) => image.image_id).join("-") || pageIndex}
            className={`grid w-full min-w-full shrink-0 snap-start gap-3 ${pageSize > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
          >
            {page.map((image, index) => {
              const absoluteIndex = pageIndex * pageSize + index;
              return (
                <div
                  key={image.image_id}
                  className={`group cursor-pointer ${buttonClassName} hover:scale-98 transition-all duration-200`}
                >
                  <div className="absolute inset-0 origin-center overflow-hidden rounded-lg transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <button
                      type="button"
                      onClick={() => onSelect(absoluteIndex)}
                      className="absolute inset-0 z-0 cursor-pointer"
                      aria-label={`${image.is_default ? "Default photo, " : ""}${image.is_primary ? "Primary photo, " : ""
                        }${image.is_hidden ? "Hidden photo, " : ""}View photo ${absoluteIndex + 1
                        } of ${images.length}`}
                    >
                      <BusinessImage
                        src={image.image_url}
                        businessId={businessId}
                        imageId={
                          image.is_default || image.image_id === DEFAULT_IMAGE_KEY
                            ? null
                            : image.image_id
                        }
                        cdnStored={imageUsesCdn(image, cdnStored)}
                        alt={`${businessName} photo ${absoluteIndex + 1}`}
                        sizes={sizes}
                        variant={variant}
                        className={`object-cover object-center ${image.is_hidden ? "opacity-40" : ""
                          }`}
                      />
                    </button>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-[1] bg-black/0 transition-all duration-300 group-hover:bg-black/15 motion-reduce:transition-none"
                    />
                  </div>
                  <PhotoBadges image={image} showHidden={Boolean(onEditImage)} />
                  {onEditImage ? (
                    <OwnerEditButton
                      className="absolute top-2 right-2 z-20 bg-card/95"
                      aria-label={`Edit photo ${absoluteIndex + 1}`}
                      onClick={() => onEditImage(image)}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showArrows ? (
        <CarouselNavButtons
          className="mt-4 flex justify-center gap-2"
          canPrev={arrows.canPrev}
          canNext={arrows.canNext}
          onPrev={() => scrollTrack(-1)}
          onNext={() => scrollTrack(1)}
        />
      ) : null}
    </div>
  );
}

function PhotosLightbox({
  open,
  onOpenChange,
  images,
  startIndex,
  businessId,
  businessName,
  cdnStored,
}) {
  const [index, setIndex] = useState(startIndex);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open || images.length <= 1) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => (current + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, images.length]);

  if (!images.length) return null;

  const image = images[index] || images[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/80"
        closeButtonClassName="bg-muted text-black hover:bg-muted hover:text-black"
        className="max-w-[min(96vw,72rem)] gap-3 border-0 bg-black p-3 text-white sm:max-w-[min(96vw,72rem)]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{businessName} photos</DialogTitle>
          <DialogDescription>
            Photo {index + 1} of {images.length}
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[min(80vh,40rem)] w-full overflow-hidden rounded-lg bg-black">
          <BusinessImage
            key={image.image_id || image.image_url}
            src={image.image_url}
            businessId={businessId}
            imageId={
              image.is_default || image.image_id === DEFAULT_IMAGE_KEY
                ? null
                : image.image_id
            }
            cdnStored={imageUsesCdn(image, cdnStored)}
            alt={`${businessName} photo ${index + 1}`}
            sizes={BUSINESS_LIGHTBOX_IMAGE_SIZES}
            variant={CF_IMAGE_VARIANT.hero}
            className={`object-contain object-center ${reduceMotion ? "" : "duration-100"
              }`}
          />

          {images.length > 1 ? (
            <>
              <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white active:translate-y-0"
                  aria-label="Previous photo"
                  onClick={() =>
                    setIndex((current) => (current - 1 + images.length) % images.length)
                  }
                >
                  <ChevronLeft />
                </Button>
              </div>
              <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white active:translate-y-0"
                  aria-label="Next photo"
                  onClick={() =>
                    setIndex((current) => (current + 1) % images.length)
                  }
                >
                  <ChevronRight />
                </Button>
              </div>
            </>
          ) : null}
        </div>

        <p className="text-center text-sm text-white/80">
          {index + 1} / {images.length}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function imageUsesCdn(image, listingCdnStored) {
  if (
    !image?.image_id ||
    image.image_id === DEFAULT_IMAGE_KEY ||
    image.is_default
  ) {
    return Boolean(listingCdnStored) && !image.image_url;
  }
  return true;
}

function PhotosAddDialog({
  open,
  onOpenChange,
  businessId,
  businessSlug,
  businessName,
  initialImages = [],
  onGalleryChange,
}) {
  const router = useRouter();
  const posthog = usePostHog();
  const { showCustomSuccess, showCustomError } = useToast();
  const inputRef = useRef(null);
  const pendingRef = useRef([]);
  const [pending, setPending] = useState([]);
  const [limit, setLimit] = useState(3);
  const [storedCount, setStoredCount] = useState(
    (initialImages || []).filter(
      (image) =>
        image?.image_id &&
        image.image_id !== DEFAULT_IMAGE_KEY &&
        !image.is_default
    ).length
  );
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState("");

  const clearPending = () => {
    pendingRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setPending([]);
  };

  useEffect(() => {
    if (!open) return undefined;

    let mounted = true;
    setFormError("");
    setLoading(true);

    fetchOwnedBusinessImages({ businessId }).then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setFormError(apiErrorMessage(error, "Unable to load listing photos."));
      }
      const stored = (data?.images || initialImages || []).filter(
        (image) =>
          image?.image_id &&
          image.image_id !== DEFAULT_IMAGE_KEY &&
          !image.is_default
      );
      setStoredCount(stored.length);
      if (typeof data?.limit === "number") setLimit(data.limit);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [open, businessId]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const usedCount = storedCount + pending.length;
  const atLimit = usedCount >= limit;

  const closeDialog = () => {
    clearPending();
    onOpenChange(false);
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length || atLimit || isSaving) return;

    const remaining = Math.max(0, limit - usedCount);
    const accepted = files.slice(0, remaining);
    if (files.length > remaining) {
      showCustomError(
        `You can add ${remaining} more photo${remaining === 1 ? "" : "s"}.`
      );
    }

    setFormError("");
    setPending((current) => [
      ...current,
      ...accepted.map((file) => ({
        localId: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const removePending = (localId) => {
    setPending((current) => {
      const target = current.find((item) => item.localId === localId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.localId !== localId);
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (isSaving || pending.length === 0) return;

    setIsSaving(true);
    setFormError("");

    try {
      for (const item of pending) {
        const { error } = await uploadOwnedBusinessImage({
          businessId,
          file: item.file,
        });
        if (error) {
          setFormError(apiErrorMessage(error, "Unable to upload this photo."));
          setIsSaving(false);
          return;
        }
        captureOwnerListingUpdate(posthog, {
          businessId,
          businessSlug,
          businessName,
          section: "photos",
          imageAction: "upload",
        });
      }

      showCustomSuccess(
        pending.length === 1 ? "Photo added." : "Photos added."
      );
      clearPending();
      onOpenChange(false);
      onGalleryChange?.();
      router.refresh();
    } catch {
      setFormError("Unable to save photo changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add photos</DialogTitle>
          <DialogDescription>
            {limit === 10
              ? "Featured listings can show up to 10 shop photos."
              : "Claimed listings can show 3 photos. Featured listings can show 10."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <Progress
            value={Math.min(usedCount, limit)}
            max={limit}
            getAriaValueText={(_formatted, value) =>
              `${value ?? 0} of ${limit} photos used`
            }
          >
            <ProgressLabel>Photos</ProgressLabel>
            <ProgressValue>
              {(_formatted, value) => `${value ?? 0} / ${limit}`}
            </ProgressValue>
          </Progress>

          <input
            ref={inputRef}
            type="file"
            accept={OWNER_IMAGE_ACCEPT}
            multiple
            className="sr-only"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!atLimit && !loading && !isSaving) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (!atLimit && !loading && !isSaving) {
                addFiles(event.dataTransfer.files);
              }
            }}
            className={`flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${isDragging
              ? "border-primary bg-tint"
              : "border-border bg-muted/40"
              } ${atLimit || loading || isSaving ? "opacity-50" : ""}`}
          >
            <Upload className="size-5 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {atLimit ? "Photo limit reached" : "Drop images here"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP. 5 MB max.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={atLimit || loading || isSaving}
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </Button>
          </div>

          {limit === 3 && atLimit ? (
            <p className="text-sm text-muted-foreground">
              Upgrade to Featured to add up to 10 photos.{" "}
              <Link
                href={`/pricing?business=${encodeURIComponent(businessId)}`}
                className="font-medium text-interactive underline hover:text-primary"
              >
                See Featured Pricing
              </Link>
              .
            </p>
          ) : null}

          {pending.length > 0 ? (
            <AttachmentGroup>
              {pending.map((item) => (
                <Attachment key={item.localId} state="idle">
                  <AttachmentMedia variant="image">
                    <img src={item.previewUrl} alt="" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{item.name}</AttachmentTitle>
                    <AttachmentDescription>
                      Ready to upload · {formatFileSize(item.size)}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      disabled={isSaving}
                      onClick={() => removePending(item.localId)}
                    >
                      <XIcon />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </AttachmentGroup>
          ) : null}

          {formError ? (
            <p className="text-xs text-red-600">{formError}</p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || pending.length === 0}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PhotosImageEditDialog({
  open,
  onOpenChange,
  image,
  images = [],
  businessId,
  businessSlug,
  businessName,
  cdnStored,
  onGalleryChange,
}) {
  const router = useRouter();
  const posthog = usePostHog();
  const { showCustomSuccess, showCustomError } = useToast();
  const [isBusy, setIsBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmDelete(false);
      setFormError("");
      setIsBusy(false);
    }
  }, [open]);

  if (!image) return null;

  const canDelete = !image.is_default && images.length > 1;
  const canHide = !image.is_primary;
  const capturePhotos = (imageAction) => {
    captureOwnerListingUpdate(posthog, {
      businessId,
      businessSlug,
      businessName,
      section: "photos",
      imageAction,
    });
  };

  const handlePrimary = async () => {
    if (isBusy || image.is_primary) return;
    setIsBusy(true);
    setFormError("");
    const { error } = await setOwnedBusinessImagePrimary({
      businessId,
      imageId: image.image_id,
    });
    setIsBusy(false);
    if (error) {
      const message = apiErrorMessage(
        error,
        "Unable to update the primary photo."
      );
      setFormError(message);
      showCustomError(message);
      return;
    }
    capturePhotos("set_primary");
    showCustomSuccess("Primary photo updated.");
    onOpenChange(false);
    onGalleryChange?.();
    router.refresh();
  };

  const handleHidden = async () => {
    if (isBusy) return;
    const nextHidden = !image.is_hidden;
    if (nextHidden && !canHide) return;
    setIsBusy(true);
    setFormError("");
    const { error } = await setOwnedBusinessImageHidden({
      businessId,
      imageId: image.image_id,
      isHidden: nextHidden,
    });
    setIsBusy(false);
    if (error) {
      const message = apiErrorMessage(
        error,
        nextHidden ? "Unable to hide this photo." : "Unable to show this photo."
      );
      setFormError(message);
      showCustomError(message);
      return;
    }
    capturePhotos(nextHidden ? "hide" : "unhide");
    showCustomSuccess(nextHidden ? "Photo hidden." : "Photo shown.");
    onOpenChange(false);
    onGalleryChange?.();
    router.refresh();
  };

  const handleDelete = async () => {
    if (isBusy || !canDelete) return;
    setIsBusy(true);
    setFormError("");
    const { error } = await deleteOwnedBusinessImage({
      businessId,
      imageId: image.image_id,
    });
    setIsBusy(false);
    if (error) {
      const message = apiErrorMessage(error, "Unable to remove this photo.");
      setFormError(message);
      showCustomError(message);
      return;
    }
    capturePhotos("delete");
    showCustomSuccess("Photo removed.");
    onOpenChange(false);
    onGalleryChange?.();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {image.is_primary ? "Primary photo" : "Edit photo"}
          </DialogTitle>
          <DialogDescription>
            {image.is_default
              ? image.is_primary
                ? "This is the original listing photo and the primary image on cards and the listing banner. Set another photo as primary if you want to hide it. It cannot be deleted."
                : "This is the original listing photo. You can hide it from the public gallery, but it cannot be deleted."
              : image.is_primary
                ? "This is the primary photo shown on cards and the listing banner. Set another photo as primary if you want to hide it."
                : "Set this as the primary photo, hide it from the public gallery, or remove it."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-56 w-full overflow-hidden rounded-lg border border-border bg-muted">
          <BusinessImage
            src={image.image_url}
            businessId={businessId}
            imageId={
              image.is_default || image.image_id === DEFAULT_IMAGE_KEY
                ? null
                : image.image_id
            }
            cdnStored={imageUsesCdn(image, cdnStored)}
            alt=""
            sizes={BUSINESS_GALLERY_IMAGE_SIZES}
            variant={CF_IMAGE_VARIANT.gallery}
            className="object-cover object-center"
          />
        </div>

        {formError ? (
          <p className="text-xs text-red-600">{formError}</p>
        ) : null}

        {!canDelete && !confirmDelete ? (
          <p className="text-xs text-muted-foreground">
            {image.is_default
              ? image.is_primary
                ? "The original listing photo cannot be deleted. Set another photo as primary before hiding it."
                : "The original listing photo cannot be deleted. Hide it if you do not want it shown in the gallery."
              : "Upload another photo before removing the last image."}
          </p>
        ) : image.is_primary && !image.is_hidden && !confirmDelete ? (
          <p className="text-xs text-muted-foreground">
            The primary photo cannot be hidden. Set another photo as primary first.
          </p>
        ) : null}

        {confirmDelete ? (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={isBusy}
            >
              Keep photo
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isBusy}
            >
              <Trash2 aria-hidden="true" />
              {isBusy ? "Removing…" : "Remove photo"}
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            {image.is_hidden || canHide ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleHidden}
                disabled={isBusy || (!image.is_hidden && !canHide)}
              >
                {image.is_hidden ? (
                  <Eye aria-hidden="true" />
                ) : (
                  <EyeOff aria-hidden="true" />
                )}
                {image.is_hidden ? "Show" : "Hide"}
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                disabled={isBusy}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            ) : null}
            {!image.is_primary ? (
              <Button type="button" onClick={handlePrimary} disabled={isBusy}>
                <Star aria-hidden="true" />
                {isBusy ? "Saving…" : "Set as primary"}
              </Button>
            ) : null}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PhotosSection({
  businessId,
  businessSlug,
  businessName,
  images: publicImages = [],
  imageUrl,
  hideDefaultImage = false,
  cdnStored = false,
}) {
  const { isOwner } = useIsBusinessOwner(businessId);
  const [addOpen, setAddOpen] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [ownerImages, setOwnerImages] = useState(null);
  const [galleryRevision, setGalleryRevision] = useState(0);

  useEffect(() => {
    if (!isOwner) {
      setOwnerImages(null);
      return undefined;
    }

    let mounted = true;
    fetchOwnedBusinessImages({ businessId }).then(({ data }) => {
      if (mounted && Array.isArray(data?.images)) {
        setOwnerImages(data.images);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isOwner, businessId, galleryRevision]);

  const refreshOwnerGallery = () => {
    setGalleryRevision((current) => current + 1);
  };

  const images =
    isOwner && ownerImages
      ? orderGalleryImages(ownerImages)
      : withDefaultListingImage(publicImages, {
          imageUrl,
          hideDefaultImage,
        });
  if (!isOwner && images.length === 0) return null;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="order-5 rounded-lg border border-border bg-card p-4 md:p-6 lg:order-1">
      <BusinessSectionHeader
        title="Photos"
        businessId={businessId}
        onEdit={() => setAddOpen(true)}
        editAriaLabel="Add photos"
        editIcon={Plus}
        titleClassName="text-xl font-semibold tracking-tight text-foreground font-heading md:text-2xl"
      />

      {images.length > 0 ? (
        <>
          <PhotosCarousel
            images={images}
            pageSize={1}
            mobileOnly
            onSelect={openLightbox}
            onEditImage={isOwner ? setEditImage : undefined}
            businessId={businessId}
            businessName={businessName}
            cdnStored={cdnStored}
            variant={CF_IMAGE_VARIANT.gallery}
            sizes={BUSINESS_GALLERY_IMAGE_SIZES}
            buttonClassName="relative h-56 w-full overflow-hidden rounded-lg border border-border bg-muted"
          />
          <PhotosCarousel
            images={images}
            pageSize={DESKTOP_PAGE_SIZE}
            desktopOnly
            onSelect={openLightbox}
            onEditImage={isOwner ? setEditImage : undefined}
            businessId={businessId}
            businessName={businessName}
            cdnStored={cdnStored}
            variant={CF_IMAGE_VARIANT.gallery}
            sizes={BUSINESS_GALLERY_IMAGE_SIZES}
            buttonClassName="relative h-56 w-full overflow-hidden rounded-lg border border-border bg-muted md:h-64"
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground md:text-base">
          Add photos of your shop so customers can see your work.
        </p>
      )}

      <PhotosLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={images}
        startIndex={lightboxIndex}
        businessId={businessId}
        businessName={businessName}
        cdnStored={cdnStored}
      />

      <PhotosAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        businessId={businessId}
        businessSlug={businessSlug}
        businessName={businessName}
        initialImages={publicImages}
        onGalleryChange={refreshOwnerGallery}
      />

      <PhotosImageEditDialog
        open={Boolean(editImage)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditImage(null);
        }}
        image={editImage}
        images={images}
        businessId={businessId}
        businessSlug={businessSlug}
        businessName={businessName}
        cdnStored={cdnStored}
        onGalleryChange={refreshOwnerGallery}
      />
    </div>
  );
}
