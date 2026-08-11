"use client";

import { useState } from "react";
import Link from "next/link";
import BusinessImage from "@/components/businesses/BusinessImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { unclaimOwnedBusiness } from "@/lib/api/ownedBusinesses";
import { usePostHog } from "posthog-js/react";
import { BUSINESS_CARD_IMAGE_SIZES } from "@/lib/images";

function formatLastEdited(value) {
  if (!value) return "Not edited yet";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Not edited yet";
  }
}

export default function OwnedBusinessCard({ business, onUnclaimed }) {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);
  const [isUnclaiming, setIsUnclaiming] = useState(false);
  const [error, setError] = useState("");

  const handleUnclaim = async () => {
    if (isUnclaiming || !business?.id) return;
    setIsUnclaiming(true);
    setError("");
    try {
      const { data, error: apiError, status } = await unclaimOwnedBusiness(
        business.id
      );
      if (status === 401) {
        onUnclaimed?.({ unauthorized: true });
        return;
      }
      if (apiError) {
        setError(
          typeof apiError.message === "string"
            ? apiError.message
            : "Unable to unclaim this business."
        );
        return;
      }
      posthog?.capture("owner_unclaimed_business", {
        business_id: business.id,
        business_slug: business.slug || undefined,
        business_name: business.title || undefined,
      });
      setOpen(false);
      onUnclaimed?.({
        businessId: business.id,
        message: data?.message || "Your listing has been unclaimed.",
      });
    } catch {
      setError("Unable to unclaim this business.");
    } finally {
      setIsUnclaiming(false);
    }
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:shadow-lg">
      <Link
        href={`/business/${business.slug}`}
        className="block min-h-0 flex-1"
        prefetch={false}
        aria-label={`View ${business.title}`}
      >
        <div className="relative h-56 w-full bg-gray-200">
          <BusinessImage
            src={business.image_url}
            businessId={business.id}
            imageId={business.primary_image_id}
            cdnStored={Boolean(business.cdn_stored)}
            alt={business.title}
            sizes={BUSINESS_CARD_IMAGE_SIZES}
            showIcon={false}
          />
        </div>

        <div className="p-5 pb-3">
          <h3 className="mb-1 line-clamp-2 font-heading text-lg font-semibold text-gray-900 hover:text-blue-600 duration-200">
            {business.title}
          </h3>
          {business.address ? (
            <p className="mb-1 text-sm text-gray-600">{business.address}</p>
          ) : (
            <p className="mb-1 text-sm text-gray-400">No address listed</p>
          )}
          <p className="text-sm text-gray-500">
            Last edited: {formatLastEdited(business.last_edited_at)}
          </p>
        </div>
      </Link>

      <div className="mt-auto border-t border-gray-100 px-5 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          Unclaim
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isUnclaiming) return;
          setOpen(nextOpen);
          if (!nextOpen) setError("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unclaim listing</DialogTitle>
            <DialogDescription>
              Unclaim{" "}
              <span className="font-medium text-foreground">
                {business.title}
              </span>
              ? You will lose owner access to edit this listing. The business
              page stays on RadiatorRepairHub and can be claimed again later.
            </DialogDescription>
          </DialogHeader>

          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUnclaiming}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleUnclaim}
              disabled={isUnclaiming}
            >
              {isUnclaiming ? "Unclaiming…" : "Unclaim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
