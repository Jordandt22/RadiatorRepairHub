"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/ToastProvider";
import {
  fetchPartnerWebsiteIntake,
  submitPartnerWebsiteIntake,
} from "@/lib/api/partnerWebsiteIntake";

const EMPTY_FORM = {
  preferredDomain: "",
  accentColor: "",
  about: "",
  servicesNotes: "",
  hoursNotes: "",
  googleUrl: "",
  logoPhotoNotes: "",
  otherNotes: "",
  contactEmail: "",
};

function formatSubmittedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WebsitePanel({ businesses = [], initialBusinessId = "" }) {
  const { showCustomError, showCustomSuccess } = useToast();
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [intake, setIntake] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const lastInitialIdRef = useRef("");

  useEffect(() => {
    if (!businesses.length) {
      setSelectedId("");
      lastInitialIdRef.current = "";
      return;
    }
    if (
      initialBusinessId &&
      initialBusinessId !== lastInitialIdRef.current &&
      businesses.some((business) => business.id === initialBusinessId)
    ) {
      lastInitialIdRef.current = initialBusinessId;
      setSelectedId(initialBusinessId);
      return;
    }
    if (!businesses.some((business) => business.id === selectedId)) {
      setSelectedId(businesses[0].id);
    }
  }, [businesses, selectedId, initialBusinessId]);

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedId) || null,
    [businesses, selectedId]
  );

  const businessOptions = useMemo(
    () =>
      businesses.map((business) => ({
        value: business.id,
        label: business.title,
      })),
    [businesses]
  );

  useEffect(() => {
    if (!selectedBusiness?.is_partner) {
      setIntake(null);
      setForm(EMPTY_FORM);
      setFieldErrors({});
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setFieldErrors({});
    fetchPartnerWebsiteIntake(selectedBusiness.id).then(({ data, error, status }) => {
      if (cancelled) return;
      if (error || status >= 400) {
        showCustomError(
          typeof error?.message === "string"
            ? error.message
            : "Unable to load website setup."
        );
        setIntake(null);
        setLoading(false);
        return;
      }
      const nextIntake = data?.intake ?? null;
      setIntake(nextIntake);
      setForm(EMPTY_FORM);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedBusiness, showCustomError]);

  const onChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field] || fieldErrors.form) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.form;
        return next;
      });
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBusiness?.is_partner || submitting) return;
    setSubmitting(true);
    setFieldErrors({});
    const { data, error, status } = await submitPartnerWebsiteIntake(
      selectedBusiness.id,
      form
    );
    setSubmitting(false);

    if (status === 422 && error?.message && typeof error.message === "object") {
      setFieldErrors(error.message);
      return;
    }
    if (error || status >= 400) {
      showCustomError(
        typeof error?.message === "string"
          ? error.message
          : "Unable to submit website details."
      );
      return;
    }

    setIntake(data?.intake ?? { status: "submitted", submittedAt: new Date().toISOString() });
    showCustomSuccess("Website details submitted. We’ll take it from here.");
  };

  if (!businesses.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="font-medium text-foreground">No businesses yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claim a listing to manage Partner website setup here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Website
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit details so we can build your Partner site.
          </p>
        </div>
        {businessOptions.length > 1 ? (
          <SelectMenu
            className="w-full sm:w-72"
            triggerClassName="w-full"
            aria-label="Business"
            value={selectedId}
            onValueChange={setSelectedId}
            options={businessOptions}
          />
        ) : null}
      </div>

      {!selectedBusiness?.is_partner ? (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-5 py-6">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Partner website setup
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Partner website setup comes with a Partner listing.
            </p>
          </div>
        </div>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading website setup…</p>
      ) : intake?.status === "submitted" ? (
        <div className="rounded-lg border border-border bg-card px-5 py-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Check className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Details submitted
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanks — we have what we need to start on your Partner website.
                {intake.submittedAt
                  ? ` Submitted ${formatSubmittedAt(intake.submittedAt)}.`
                  : ""}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Site analytics will show here after your site is live and
                connected.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="rounded-lg border border-border bg-card px-5 py-6"
        >
          <p className="mb-5 text-sm text-muted-foreground">
            Share whatever you have now. You can leave fields blank if you are
            not sure yet.
          </p>
          {fieldErrors.form ? (
            <p className="mb-4 text-sm text-destructive">{fieldErrors.form}</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Preferred domain
              <Input
                value={form.preferredDomain}
                onChange={onChange("preferredDomain")}
                placeholder="ironbayradiator.com"
                disabled={submitting}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Accent color
              <Input
                value={form.accentColor}
                onChange={onChange("accentColor")}
                placeholder="#E31B16"
                disabled={submitting}
                aria-invalid={Boolean(fieldErrors.accentColor)}
              />
              {fieldErrors.accentColor ? (
                <span className="text-xs text-destructive">
                  {fieldErrors.accentColor}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Contact email for the site
              <Input
                type="email"
                value={form.contactEmail}
                onChange={onChange("contactEmail")}
                placeholder="shop@example.com"
                disabled={submitting}
                aria-invalid={Boolean(fieldErrors.contactEmail)}
              />
              {fieldErrors.contactEmail ? (
                <span className="text-xs text-destructive">
                  {fieldErrors.contactEmail}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Google Business / review URL
              <Input
                value={form.googleUrl}
                onChange={onChange("googleUrl")}
                placeholder="https://g.page/..."
                disabled={submitting}
                aria-invalid={Boolean(fieldErrors.googleUrl)}
              />
              {fieldErrors.googleUrl ? (
                <span className="text-xs text-destructive">
                  {fieldErrors.googleUrl}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              About the shop
              <Textarea
                value={form.about}
                onChange={onChange("about")}
                rows={4}
                disabled={submitting}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Services notes
              <Textarea
                value={form.servicesNotes}
                onChange={onChange("servicesNotes")}
                rows={3}
                disabled={submitting}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Hours notes
              <Textarea
                value={form.hoursNotes}
                onChange={onChange("hoursNotes")}
                rows={3}
                disabled={submitting}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Logo and photo notes
              <Textarea
                value={form.logoPhotoNotes}
                onChange={onChange("logoPhotoNotes")}
                rows={3}
                placeholder="Where to find your logo, preferred shop photos, etc."
                disabled={submitting}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Anything else
              <Textarea
                value={form.otherNotes}
                onChange={onChange("otherNotes")}
                rows={3}
                disabled={submitting}
              />
            </label>
          </div>
          <Button type="submit" className="mt-6" disabled={submitting} size="lg">
            {submitting ? "Submitting…" : "Submit website details"}
          </Button>
        </form>
      )}
    </div>
  );
}
