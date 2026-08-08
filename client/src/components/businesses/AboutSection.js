"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ToastProvider, useToast } from "@/contexts/ToastProvider";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import BusinessImage from "@/components/businesses/BusinessImage";
import { updateBusinessAbout } from "@/lib/api/businessAbout";
import { BUSINESS_ABOUT_IMAGE_SIZES } from "@/lib/images";

export const ABOUT_MAX_LENGTH = 750;

function mapApiErrorsToFields(error) {
  const message = error?.message;
  if (message && typeof message === "object" && !Array.isArray(message)) {
    if (typeof message.description === "string") {
      return { description: message.description };
    }
  }

  if (typeof message === "string") {
    const lower = message.toLowerCase();
    if (lower.includes("description") || lower.includes("about")) {
      return { description: message };
    }
    return { form: message };
  }

  return { form: "Unable to update about section." };
}

function AboutSectionContent({
  businessId,
  description: initialDescription = "",
  imageUrl,
  placeId,
  imageId,
  cdnStored,
  imageAlt,
}) {
  const router = useRouter();
  const { showCustomSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription || "");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDescription(initialDescription || "");
    setErrors({});
  }, [open, initialDescription]);

  const normalize = (value) => (typeof value === "string" ? value.trim() : "");
  const hasChanges =
    normalize(description) !== normalize(initialDescription);
  const characterCount = description.length;

  const clearFieldError = () => {
    setErrors((prev) => {
      if (!prev.description && !prev.form) return prev;
      const next = { ...prev };
      delete next.description;
      delete next.form;
      return next;
    });
  };

  const validate = () => {
    const next = {};
    const trimmed = normalize(description);
    if (!trimmed) {
      next.description = "About text is required.";
    } else if (description.length > ABOUT_MAX_LENGTH) {
      next.description = `About text must be ${ABOUT_MAX_LENGTH} characters or fewer.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= ABOUT_MAX_LENGTH) {
      setDescription(value);
      clearFieldError();
      return;
    }
    setDescription(value.slice(0, ABOUT_MAX_LENGTH));
    clearFieldError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !hasChanges) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const { error } = await updateBusinessAbout({
        businessId,
        description: normalize(description),
      });

      if (error) {
        setErrors(mapApiErrorsToFields(error));
        return;
      }

      showCustomSuccess("About section updated.");
      setOpen(false);
      router.refresh();
    } catch {
      setErrors({ form: "Unable to update about section." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDisabled =
    isSubmitting ||
    !hasChanges ||
    !normalize(description) ||
    description.length > ABOUT_MAX_LENGTH;

  return (
    <div className="order-1 rounded-xl bg-white p-4 shadow-lg md:p-6 lg:order-1">
      <BusinessSectionHeader
        title="About Our Business"
        businessId={businessId}
        onEdit={() => setOpen(true)}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className="space-y-4 md:col-span-2">
          <p className="text-sm leading-relaxed text-gray-600 md:text-base whitespace-pre-wrap">
            {initialDescription || "No description available."}
          </p>
        </div>

        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200 md:h-64">
          <BusinessImage
            src={imageUrl}
            placeId={placeId}
            businessId={businessId}
            imageId={imageId}
            cdnStored={Boolean(cdnStored)}
            alt={imageAlt}
            sizes={BUSINESS_ABOUT_IMAGE_SIZES}
            className="object-cover object-center"
            iconSize="sm"
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit About</DialogTitle>
            <DialogDescription>
              Tell customers about your shop. Maximum {ABOUT_MAX_LENGTH}{" "}
              characters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="about-description"
                className="text-sm font-medium text-gray-800"
              >
                About <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="about-description"
                value={description}
                onChange={handleChange}
                disabled={isSubmitting}
                maxLength={ABOUT_MAX_LENGTH}
                rows={8}
                aria-invalid={Boolean(errors.description)}
                aria-describedby="about-description-count about-description-error"
                className="min-h-40 rounded-lg border-gray-200 bg-white"
                placeholder="Describe your business, services, and what makes your shop unique…"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {errors.description ? (
                    <p
                      id="about-description-error"
                      className="text-xs text-red-600"
                    >
                      {errors.description}
                    </p>
                  ) : null}
                </div>
                <p
                  id="about-description-count"
                  className={`shrink-0 text-xs tabular-nums ${
                    characterCount >= ABOUT_MAX_LENGTH
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {characterCount} / {ABOUT_MAX_LENGTH}
                </p>
              </div>
            </div>

            {errors.form ? (
              <p className="text-xs text-red-600">{errors.form}</p>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveDisabled}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AboutSection(props) {
  return (
    <ToastProvider>
      <AboutSectionContent {...props} />
    </ToastProvider>
  );
}
