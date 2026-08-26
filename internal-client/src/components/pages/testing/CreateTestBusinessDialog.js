"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchTestBusinessDefaults, createTestBusiness } from "@/lib/api/testing";

function Field({ id, label, children, hint }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function payloadFromDraft(draft) {
  return {
    title: draft.title,
    slug: draft.slug,
    email: draft.email || null,
    phone: draft.phone,
    address: draft.address,
    website: draft.website || null,
    total_score: Number(draft.total_score),
    reviews_count: Number(draft.reviews_count),
    latitude: Number(draft.latitude),
    longitude: Number(draft.longitude),
    city_id: draft.city_id,
    state_id: draft.state_id,
    postal_code_id: draft.postal_code_id || null,
    primary_category_id: draft.primary_category_id,
    timezone: draft.timezone,
    description: draft.description,
    title_tag: draft.title_tag,
    meta_description: draft.meta_description,
    local_note: draft.local_note,
    keywords: Array.isArray(draft.keywords) ? draft.keywords : [],
    highlights: Array.isArray(draft.highlights) ? draft.highlights : [],
    image_url: draft.image_url || null,
    place_id: draft.place_id,
    hours: Array.isArray(draft.hours) ? draft.hours : [],
    secondary_category_ids: Array.isArray(draft.secondary_category_ids)
      ? draft.secondary_category_ids
      : [],
  };
}

export default function CreateTestBusinessDialog({
  open,
  onOpenChange,
  accessToken,
  onCreated,
}) {
  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !accessToken) return;
    let cancelled = false;
    setLoadError(null);
    setSubmitError(null);
    setDraft(null);
    setLoading(true);

    fetchTestBusinessDefaults({ accessToken }).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.error || !result.data) {
        setLoadError(
          result.error?.message || "Unable to load test business defaults.",
        );
        return;
      }
      setDraft(result.data);
    });

    return () => {
      cancelled = true;
    };
  }, [open, accessToken]);

  const updateField = (key, value) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await createTestBusiness({
        accessToken,
        body: payloadFromDraft(draft),
      });
      if (result.error || !result.data) {
        const message = result.error?.message;
        setSubmitError(
          typeof message === "string"
            ? message
            : message
              ? Object.values(message)[0]
              : "Unable to create test business.",
        );
        return;
      }
      onCreated?.(result.data);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = loading || submitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="sm:max-w-xl"
        showCloseButton={!submitting}
      >
        <DialogHeader>
          <DialogTitle>Create test business</DialogTitle>
          <DialogDescription>
            Required fields are prefilled from an existing listing. Edit anything
            you need, or create it as-is. The listing is unclaimed.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading defaults…</p>
        ) : null}
        {loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : null}

        {draft ? (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Field id="test-biz-title" label="Title">
              <Input
                id="test-biz-title"
                value={draft.title ?? ""}
                onChange={(e) => updateField("title", e.target.value)}
                disabled={busy}
                autoComplete="off"
                autoFocus
              />
            </Field>
            <Field id="test-biz-slug" label="Slug">
              <Input
                id="test-biz-slug"
                value={draft.slug ?? ""}
                onChange={(e) => updateField("slug", e.target.value)}
                disabled={busy}
                autoComplete="off"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="test-biz-email" label="Email">
                <Input
                  id="test-biz-email"
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  disabled={busy}
                  autoComplete="off"
                />
              </Field>
              <Field id="test-biz-phone" label="Phone">
                <Input
                  id="test-biz-phone"
                  value={draft.phone ?? ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  disabled={busy}
                  autoComplete="off"
                />
              </Field>
            </div>
            <Field id="test-biz-address" label="Address">
              <Input
                id="test-biz-address"
                value={draft.address ?? ""}
                onChange={(e) => updateField("address", e.target.value)}
                disabled={busy}
                autoComplete="off"
              />
            </Field>
            <Field id="test-biz-website" label="Website">
              <Input
                id="test-biz-website"
                value={draft.website ?? ""}
                onChange={(e) => updateField("website", e.target.value)}
                disabled={busy}
                autoComplete="off"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="test-biz-score" label="Score">
                <Input
                  id="test-biz-score"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={draft.total_score ?? ""}
                  onChange={(e) => updateField("total_score", e.target.value)}
                  disabled={busy}
                />
              </Field>
              <Field id="test-biz-reviews" label="Reviews">
                <Input
                  id="test-biz-reviews"
                  type="number"
                  min="0"
                  value={draft.reviews_count ?? ""}
                  onChange={(e) => updateField("reviews_count", e.target.value)}
                  disabled={busy}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="test-biz-lat" label="Latitude">
                <Input
                  id="test-biz-lat"
                  type="number"
                  step="any"
                  value={draft.latitude ?? ""}
                  onChange={(e) => updateField("latitude", e.target.value)}
                  disabled={busy}
                />
              </Field>
              <Field id="test-biz-lng" label="Longitude">
                <Input
                  id="test-biz-lng"
                  type="number"
                  step="any"
                  value={draft.longitude ?? ""}
                  onChange={(e) => updateField("longitude", e.target.value)}
                  disabled={busy}
                />
              </Field>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              <p>
                <span className="text-muted-foreground">Location: </span>
                {draft.location_label || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Category: </span>
                {draft.category_label || "—"}
              </p>
            </div>
            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                className="cursor-pointer rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="cursor-pointer rounded-full"
              >
                {submitting ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
