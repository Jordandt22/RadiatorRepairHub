"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
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
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useToast } from "@/contexts/ToastProvider";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import {
  fetchPrimaryCategories,
  fetchSecondaryCategories,
} from "@/lib/api/categories";
import { updateBusinessCategories } from "@/lib/api/businessCategories";

const MAX_SECONDARY = 10;

function CategoryChip({ label, onRemove, disabled }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-tint px-2.5 py-1 text-sm font-medium text-primary capitalize">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-primary hover:bg-secondary disabled:opacity-50"
        aria-label={`Remove ${label}`}
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

function mapApiErrorsToFields(error) {
  const message = error?.message;
  if (message && typeof message === "object" && !Array.isArray(message)) {
    const next = {};
    if (typeof message.primaryCategoryId === "string") {
      next.primary = message.primaryCategoryId;
    }
    if (typeof message.secondaryCategoryIds === "string") {
      next.secondary = message.secondaryCategoryIds;
    }
    if (Object.keys(next).length > 0) return next;
  }

  if (typeof message === "string") {
    const lower = message.toLowerCase();
    if (lower.includes("primary")) return { primary: message };
    if (lower.includes("secondary")) return { secondary: message };
    return { form: message };
  }

  return { form: "Unable to update service categories." };
}

function sameIdSet(a, b) {
  const left = [...(a ?? [])].map(String).sort();
  const right = [...(b ?? [])].map(String).sort();
  if (left.length !== right.length) return false;
  return left.every((id, index) => id === right[index]);
}

function ServiceCategoriesSectionContent({
  businessId,
  primaryCategory: initialPrimary,
  secondaryCategories: initialSecondary = [],
}) {
  const router = useRouter();
  const { showCustomSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [primary, setPrimary] = useState(initialPrimary ?? null);
  const [secondary, setSecondary] = useState(initialSecondary ?? []);
  const [primaryOptions, setPrimaryOptions] = useState([]);
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [primaryComboboxKey, setPrimaryComboboxKey] = useState(0);
  const [secondaryComboboxKey, setSecondaryComboboxKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPrimary(initialPrimary ?? null);
    setSecondary(Array.isArray(initialSecondary) ? initialSecondary : []);
    setErrors({});
  }, [open, initialPrimary, initialSecondary]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    async function load() {
      setLoadingCategories(true);
      try {
        const [primaryRes, secondaryRes] = await Promise.all([
          fetchPrimaryCategories(),
          fetchSecondaryCategories(),
        ]);
        if (!mounted) return;
        setPrimaryOptions(
          Array.isArray(primaryRes.data) ? primaryRes.data : []
        );
        setSecondaryOptions(
          Array.isArray(secondaryRes.data) ? secondaryRes.data : []
        );
        if (primaryRes.error || secondaryRes.error) {
          setErrors({
            form:
              primaryRes.error?.message ||
              secondaryRes.error?.message ||
              "Unable to load categories.",
          });
        }
      } catch {
        if (mounted) {
          setErrors({ form: "Unable to load categories." });
        }
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [open]);

  const initialPrimaryId = initialPrimary?.id ?? null;
  const initialSecondaryIds = useMemo(
    () => (initialSecondary ?? []).map((c) => c.id),
    [initialSecondary]
  );

  const hasChanges =
    (primary?.id ?? null) !== initialPrimaryId ||
    !sameIdSet(
      secondary.map((c) => c.id),
      initialSecondaryIds
    );

  const availablePrimaryNames = useMemo(() => {
    return primaryOptions.map((c) => c.name);
  }, [primaryOptions]);

  const availableSecondaryNames = useMemo(() => {
    const selected = new Set(secondary.map((c) => c.id));
    return secondaryOptions
      .filter((c) => !selected.has(c.id))
      .map((c) => c.name);
  }, [secondaryOptions, secondary]);

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field] && !prev.form) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!primary?.id) {
      next.primary = "Primary category is required.";
    }
    if (secondary.length > MAX_SECONDARY) {
      next.secondary = `You can select up to ${MAX_SECONDARY} secondary categories.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePrimarySelect = (name) => {
    if (!name) return;
    const match = primaryOptions.find((c) => c.name === name);
    if (!match) return;
    setPrimary(match);
    setPrimaryComboboxKey((key) => key + 1);
    clearFieldError("primary");
  };

  const handleSecondarySelect = (name) => {
    if (!name) return;
    if (secondary.length >= MAX_SECONDARY) {
      setErrors((prev) => ({
        ...prev,
        secondary: `You can select up to ${MAX_SECONDARY} secondary categories.`,
      }));
      setSecondaryComboboxKey((key) => key + 1);
      return;
    }
    const match = secondaryOptions.find((c) => c.name === name);
    if (!match) return;
    if (secondary.some((c) => c.id === match.id)) {
      setSecondaryComboboxKey((key) => key + 1);
      return;
    }
    setSecondary((prev) => [...prev, match]);
    setSecondaryComboboxKey((key) => key + 1);
    clearFieldError("secondary");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !hasChanges || loadingCategories) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const { error } = await updateBusinessCategories({
        businessId,
        primaryCategoryId: primary.id,
        secondaryCategoryIds: secondary.map((c) => c.id),
      });

      if (error) {
        setErrors(mapApiErrorsToFields(error));
        return;
      }

      showCustomSuccess("Service categories updated.");
      setOpen(false);
      router.refresh();
    } catch {
      setErrors({ form: "Unable to update service categories." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDisabled =
    isSubmitting || !hasChanges || loadingCategories || !primary?.id;

  return (
    <div className="order-5 bg-card rounded-lg border border-border p-4 md:p-6 lg:order-2">
      <BusinessSectionHeader
        title="Service Categories"
        businessId={businessId}
        onEdit={() => setOpen(true)}
      />
      <div className="space-y-3 md:space-y-4">
        <div>
          <h3 className="mb-2 text-base font-semibold text-foreground md:text-lg">
            Primary Category
          </h3>
          {initialPrimary ? (
            <Link
              href={`/category/${initialPrimary.slug}`}
              className="inline-block rounded-lg bg-tint px-3 py-1.5 text-sm font-medium capitalize text-primary transition-colors duration-300 hover:bg-secondary md:px-4 md:py-2 md:text-base"
            >
              {initialPrimary.name}
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground md:text-base">None</p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-base font-semibold text-foreground md:text-lg">
            Secondary Categories
          </h3>
          {initialSecondary?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {initialSecondary.map((category) => (
                <Link
                  href={`/search?secondary_categories=${category.id}`}
                  key={category.id}
                  className="rounded-full bg-muted px-3 py-1 text-sm capitalize text-foreground duration-200 hover:bg-secondary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">None</p>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Service Categories</DialogTitle>
            <DialogDescription>
              Choose one primary category and up to {MAX_SECONDARY} secondary
              categories.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Primary category <span className="text-red-500">*</span>
              </label>
              <Combobox
                key={`primary-${primaryComboboxKey}`}
                items={availablePrimaryNames}
                value={null}
                onValueChange={handlePrimarySelect}
                disabled={isSubmitting || loadingCategories}
              >
                <ComboboxInput
                  placeholder={
                    loadingCategories
                      ? "Loading categories…"
                      : "Search primary categories"
                  }
                  disabled={isSubmitting || loadingCategories}
                  className="w-full"
                />
                <ComboboxContent className="z-[100]">
                  <ComboboxEmpty>
                    {loadingCategories
                      ? "Loading…"
                      : "No matching primary category."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {primary ? (
                <div className="flex flex-wrap gap-2">
                  <CategoryChip
                    label={primary.name}
                    disabled={isSubmitting}
                    onRemove={() => {
                      setPrimary(null);
                      clearFieldError("primary");
                    }}
                  />
                </div>
              ) : null}
              {errors.primary ? (
                <p className="text-xs text-red-600">{errors.primary}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Secondary categories{" "}
                <span className="font-normal text-muted-foreground">
                  ({secondary.length}/{MAX_SECONDARY})
                </span>
              </label>
              <Combobox
                key={`secondary-${secondaryComboboxKey}`}
                items={availableSecondaryNames}
                value={null}
                onValueChange={handleSecondarySelect}
                disabled={
                  isSubmitting ||
                  loadingCategories ||
                  secondary.length >= MAX_SECONDARY
                }
              >
                <ComboboxInput
                  placeholder={
                    loadingCategories
                      ? "Loading categories…"
                      : secondary.length >= MAX_SECONDARY
                        ? "Maximum secondary categories selected"
                        : "Search secondary categories"
                  }
                  disabled={
                    isSubmitting ||
                    loadingCategories ||
                    secondary.length >= MAX_SECONDARY
                  }
                  className="w-full"
                />
                <ComboboxContent className="z-[100]">
                  <ComboboxEmpty>
                    {loadingCategories
                      ? "Loading…"
                      : "No matching secondary category."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {secondary.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {secondary.map((category) => (
                    <CategoryChip
                      key={category.id}
                      label={category.name}
                      disabled={isSubmitting}
                      onRemove={() => {
                        setSecondary((prev) =>
                          prev.filter((c) => c.id !== category.id)
                        );
                        clearFieldError("secondary");
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {errors.secondary ? (
                <p className="text-xs text-red-600">{errors.secondary}</p>
              ) : null}
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

export default function ServiceCategoriesSection(props) {
  return <ServiceCategoriesSectionContent {...props} />;
}
