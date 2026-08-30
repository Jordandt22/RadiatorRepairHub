"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Wrench,
  Nfc,
  Car,
  Store,
  Toilet,
  Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePostHog } from "posthog-js/react";
import { useToast } from "@/contexts/ToastProvider";
import { captureOwnerListingUpdate } from "@/lib/analytics/ownerListing";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";
import {
  AMENITY_GROUPS,
  amenityFlagsEqual,
  normalizeAmenityFlags,
} from "@/lib/data/amenityGroups";
import { updateBusinessAmenities } from "@/lib/api/businessAmenities";

const FEATURE_ICONS = {
  appointments_recommended: CalendarDays,
  credit_cards: CreditCard,
  debit_cards: CreditCard,
  mechanic: Wrench,
  nfc_mobile_payments: Nfc,
  oil_change: Car,
  onsite_services: Store,
  restroom: Toilet,
  wheelchair_accessible: Accessibility,
};

function AmenityRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      {Icon ? (
        <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      ) : null}
      <span className="text-sm capitalize text-foreground">{label}</span>
    </div>
  );
}

function AmenitiesSectionContent({
  businessId,
  businessSlug,
  businessName,
  features = {},
}) {
  const router = useRouter();
  const posthog = usePostHog();
  const { showCustomSuccess } = useToast();
  const { showOwnerChrome } = useOwnerListingView();
  const initialFlags = useMemo(
    () => normalizeAmenityFlags(features),
    [features]
  );

  const [open, setOpen] = useState(false);
  const [flags, setFlags] = useState(initialFlags);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFlags(initialFlags);
    setErrors({});
  }, [open, initialFlags]);

  const hasAnyAmenity = AMENITY_GROUPS.some((group) =>
    group.options.some((option) => initialFlags[option.key])
  );

  if (!showOwnerChrome && !hasAnyAmenity) {
    return null;
  }

  const hasChanges = !amenityFlagsEqual(flags, initialFlags);
  const saveDisabled = isSubmitting || !hasChanges;

  const toggleFlag = (key) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    setErrors((prev) => {
      if (!prev.form) return prev;
      const next = { ...prev };
      delete next.form;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !hasChanges) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const { error } = await updateBusinessAmenities({
        businessId,
        features: flags,
      });

      if (error) {
        setErrors({
          form:
            typeof error.message === "string"
              ? error.message
              : "Unable to update amenities.",
        });
        return;
      }

      showCustomSuccess("Amenities updated.");
      captureOwnerListingUpdate(posthog, {
        businessId,
        businessSlug,
        businessName,
        section: "amenities",
      });
      setOpen(false);
      router.refresh();
    } catch {
      setErrors({ form: "Unable to update amenities." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-8 rounded-lg border border-border bg-card p-4 md:p-6 lg:order-4">
      <BusinessSectionHeader
        title="Amenities"
        businessId={businessId}
        onEdit={() => setOpen(true)}
      />

      <div className="space-y-3 md:space-y-4">
        {AMENITY_GROUPS.map((group) => {
          const active = group.options.filter(
            (option) => initialFlags[option.key]
          );

          return (
            <div key={group.id}>
              <h3 className="mb-2 text-base font-semibold text-foreground md:text-lg">
                {group.title}
              </h3>
              {active.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {active.map((option) => (
                    <AmenityRow
                      key={option.key}
                      icon={FEATURE_ICONS[option.key]}
                      label={option.label}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Amenities</DialogTitle>
            <DialogDescription>
              Choose payment methods, accessibility options, and other amenities
              for this shop.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {AMENITY_GROUPS.map((group) => (
              <fieldset key={group.id} className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  {group.title}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.options.map((option) => (
                    <label
                      key={option.key}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(flags[option.key])}
                        onChange={() => toggleFlag(option.key)}
                        disabled={isSubmitting}
                        className="rounded border-border text-primary focus:ring-ring"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

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

export default function AmenitiesSection(props) {
  return <AmenitiesSectionContent {...props} />;
}
