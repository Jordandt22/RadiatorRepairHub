"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/api/fetchApi";

const MAX_SECONDARY = 10;

function CategoryChip({ label, onRemove, disabled }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-transparent bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-sky-700 hover:bg-sky-200 hover:text-sky-900 disabled:opacity-50"
        aria-label={`Remove ${label}`}
      >
        <XIcon className="size-3.5" />
      </button>
    </span>
  );
}

function sameIdSet(a, b) {
  const left = [...(a ?? [])].map(String).sort();
  const right = [...(b ?? [])].map(String).sort();
  if (left.length !== right.length) return false;
  return left.every((id, index) => id === right[index]);
}

function CategorySearchCombobox({
  items,
  onSelect,
  disabled,
  placeholder,
  emptyLabel,
  inputName,
  resetKey,
}) {
  return (
    <Combobox
      key={resetKey}
      items={items}
      value={null}
      onValueChange={(item) => {
        if (!item) return;
        const resolved =
          typeof item === "string"
            ? items.find((category) => category.id === item || category.name === item)
            : item;
        if (!resolved?.id) return;
        onSelect(resolved);
      }}
      itemToStringLabel={(item) => item?.name ?? ""}
      itemToStringValue={(item) => item?.id ?? ""}
      isItemEqualToValue={(a, b) => a?.id === b?.id}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        name={inputName}
        className="w-full"
      />
      <ComboboxContent className="rounded-lg">
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              <span className="truncate">{item.name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function BusinessListingCategoriesEditDialog({
  open,
  onOpenChange,
  business = null,
  accessToken,
  logout,
  onSubmit,
  submitPending = false,
  submitError = null,
}) {
  const [primary, setPrimary] = useState(business?.primary_category ?? null);
  const [secondary, setSecondary] = useState(
    Array.isArray(business?.secondary_categories)
      ? business.secondary_categories
      : []
  );
  const [errors, setErrors] = useState({});
  const [primaryComboboxKey, setPrimaryComboboxKey] = useState(0);
  const [secondaryComboboxKey, setSecondaryComboboxKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPrimary(business?.primary_category ?? null);
    setSecondary(
      Array.isArray(business?.secondary_categories)
        ? business.secondary_categories
        : []
    );
    setErrors({});
  }, [open, business]);

  const primaryQuery = useQuery({
    queryKey: ["admin-primary-categories"],
    enabled: Boolean(open && accessToken),
    queryFn: async () => {
      const result = await fetchApi("/categories/primary", { accessToken });
      if (result.status === 401) {
        logout?.();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load categories");
      }
      return Array.isArray(result.data) ? result.data : [];
    },
    staleTime: 5 * 60_000,
  });

  const secondaryQuery = useQuery({
    queryKey: ["admin-secondary-categories"],
    enabled: Boolean(open && accessToken),
    queryFn: async () => {
      const result = await fetchApi("/categories/secondary", { accessToken });
      if (result.status === 401) {
        logout?.();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load categories");
      }
      return Array.isArray(result.data) ? result.data : [];
    },
    staleTime: 5 * 60_000,
  });

  const loadingCategories = primaryQuery.isLoading || secondaryQuery.isLoading;
  const loadError =
    primaryQuery.error?.message || secondaryQuery.error?.message || null;

  const initialPrimaryId = business?.primary_category?.id ?? null;
  const initialSecondaryIds = useMemo(
    () => (business?.secondary_categories ?? []).map((category) => category.id),
    [business]
  );

  const hasChanges =
    (primary?.id ?? null) !== initialPrimaryId ||
    !sameIdSet(
      secondary.map((category) => category.id),
      initialSecondaryIds
    );

  const availablePrimary = primaryQuery.data ?? [];
  const availableSecondary = useMemo(() => {
    const selected = new Set(secondary.map((category) => category.id));
    return (secondaryQuery.data ?? []).filter(
      (category) => !selected.has(category.id)
    );
  }, [secondaryQuery.data, secondary]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitPending || !hasChanges || loadingCategories || !business?.id) {
      return;
    }
    if (!validate()) return;

    await onSubmit({
      business_id: business.id,
      primary_category_id: primary.id,
      secondary_category_ids: secondary.map((category) => category.id),
    });
  };

  const saveDisabled =
    submitPending ||
    !hasChanges ||
    loadingCategories ||
    !primary?.id ||
    Boolean(loadError);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        showCloseButton={!submitPending}
      >
        <DialogHeader>
          <DialogTitle>Edit categories</DialogTitle>
          <DialogDescription>
            Choose one primary category and up to {MAX_SECONDARY} secondary
            categories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Primary category</Label>
            <CategorySearchCombobox
              resetKey={`primary-${primaryComboboxKey}`}
              items={availablePrimary}
              disabled={submitPending || loadingCategories}
              placeholder={
                loadingCategories
                  ? "Loading categories…"
                  : "Search primary categories"
              }
              emptyLabel={
                loadingCategories ? "Loading…" : "No matching primary category."
              }
              inputName="business-listing-primary-category"
              onSelect={(item) => {
                setPrimary(item);
                setPrimaryComboboxKey((key) => key + 1);
                clearFieldError("primary");
              }}
            />
            {primary ? (
              <div className="flex flex-wrap gap-2">
                <CategoryChip
                  label={primary.name}
                  disabled={submitPending}
                  onRemove={() => {
                    setPrimary(null);
                    clearFieldError("primary");
                  }}
                />
              </div>
            ) : null}
            {errors.primary ? (
              <p className="text-xs text-destructive">{errors.primary}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label>
              Secondary categories{" "}
              <span className="font-normal text-muted-foreground">
                ({secondary.length}/{MAX_SECONDARY})
              </span>
            </Label>
            <CategorySearchCombobox
              resetKey={`secondary-${secondaryComboboxKey}`}
              items={availableSecondary}
              disabled={
                submitPending ||
                loadingCategories ||
                secondary.length >= MAX_SECONDARY
              }
              placeholder={
                loadingCategories
                  ? "Loading categories…"
                  : secondary.length >= MAX_SECONDARY
                    ? "Maximum secondary categories selected"
                    : "Search secondary categories"
              }
              emptyLabel={
                loadingCategories
                  ? "Loading…"
                  : "No matching secondary category."
              }
              inputName="business-listing-secondary-category"
              onSelect={(item) => {
                if (secondary.length >= MAX_SECONDARY) {
                  setErrors((prev) => ({
                    ...prev,
                    secondary: `You can select up to ${MAX_SECONDARY} secondary categories.`,
                  }));
                  setSecondaryComboboxKey((key) => key + 1);
                  return;
                }
                if (secondary.some((category) => category.id === item.id)) {
                  setSecondaryComboboxKey((key) => key + 1);
                  return;
                }
                setSecondary((prev) => [...prev, item]);
                setSecondaryComboboxKey((key) => key + 1);
                clearFieldError("secondary");
              }}
            />
            {secondary.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {secondary.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.name}
                    disabled={submitPending}
                    onRemove={() => {
                      setSecondary((prev) =>
                        prev.filter((item) => item.id !== category.id)
                      );
                      clearFieldError("secondary");
                    }}
                  />
                ))}
              </div>
            ) : null}
            {errors.secondary ? (
              <p className="text-xs text-destructive">{errors.secondary}</p>
            ) : null}
          </div>

          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : null}
          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={submitPending || !hasChanges}
              className="cursor-pointer rounded-full"
              onClick={() => {
                setPrimary(business?.primary_category ?? null);
                setSecondary(
                  Array.isArray(business?.secondary_categories)
                    ? business.secondary_categories
                    : []
                );
                setErrors({});
              }}
            >
              Reset
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={submitPending}
                className="cursor-pointer rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveDisabled}
                className="cursor-pointer rounded-full"
              >
                {submitPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
