"use client";

import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { Textarea } from "@/components/ui/textarea";

const ABOUT_MAX_LENGTH = 750;

const isValidPhone = (value) => {
  if (!value?.trim()) return false;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

const normalizeWebsiteUrl = (raw) => {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const keywordsToInput = (keywords) => {
  if (!Array.isArray(keywords)) return "";
  return keywords
    .map((keyword) => String(keyword ?? "").trim())
    .filter(Boolean)
    .join(", ");
};

const parseKeywordsInput = (raw) => {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 30);
};

const listingEditSchema = Yup.object({
  title: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .required("Title is required"),
  email: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? "" : value))
    .test("valid-email", "Please enter a valid email address", (value) => {
      if (value == null || value === "") return true;
      return Yup.string().email().isValidSync(value);
    }),
  website: Yup.string()
    .trim()
    .test("valid-website", "Please enter a valid website URL", (value) => {
      if (value == null || value === "") return true;
      try {
        const parsed = new URL(normalizeWebsiteUrl(value));
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    }),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .test("valid-phone", "Please enter a valid phone number", isValidPhone),
  address: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Address is required")
    .max(500, "Address is too long")
    .required("Address is required"),
  description: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Description is required")
    .max(ABOUT_MAX_LENGTH, `Description must be ${ABOUT_MAX_LENGTH} characters or fewer`)
    .required("Description is required"),
  title_tag: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Title tag is required")
    .max(100, "Title tag is too long")
    .required("Title tag is required"),
  meta_description: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Meta description is required")
    .max(200, "Meta description is too long")
    .required("Meta description is required"),
  local_note: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Local note is required")
    .max(500, "Local note is too long")
    .required("Local note is required"),
  keywords: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .test("keywords-count", "At most 30 keywords", (value) => {
      return parseKeywordsInput(value).length <= 30;
    })
    .test("keyword-length", "Each keyword must be 100 characters or fewer", (value) => {
      return parseKeywordsInput(value).every((keyword) => keyword.length <= 100);
    }),
});

function getInitialValues(business) {
  return {
    title: business?.title ?? "",
    email: business?.email ?? "",
    website: business?.website ?? "",
    phone: business?.phone ?? "",
    address: business?.address ?? "",
    description: business?.description ?? "",
    title_tag: business?.title_tag ?? "",
    meta_description: business?.meta_description ?? "",
    local_note: business?.local_note ?? "",
    keywords: keywordsToInput(business?.keywords),
  };
}

function FieldError({ touched, error }) {
  if (!touched || !error) return null;
  return <p className="text-xs text-destructive">{error}</p>;
}

export default function BusinessListingEditDialog({
  open,
  onOpenChange,
  business = null,
  onSubmit,
  submitPending = false,
  submitError = null,
}) {
  const formik = useFormik({
    initialValues: getInitialValues(business),
    enableReinitialize: true,
    validationSchema: listingEditSchema,
    onSubmit: async (values) => {
      if (!business?.id) return;
      const websiteTrimmed = values.website.trim();
      await onSubmit({
        business_id: business.id,
        title: values.title.trim(),
        email: values.email.trim() || null,
        website: websiteTrimmed ? normalizeWebsiteUrl(websiteTrimmed) : null,
        phone: values.phone.trim(),
        address: values.address.trim(),
        description: values.description.trim(),
        title_tag: values.title_tag.trim(),
        meta_description: values.meta_description.trim(),
        local_note: values.local_note.trim(),
        keywords: parseKeywordsInput(values.keywords),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm({
        values: getInitialValues(business),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when dialog closes
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        showCloseButton={!submitPending}
      >
        <DialogHeader>
          <DialogTitle>Edit listing</DialogTitle>
          <DialogDescription>
            Update contact details, About text, and SEO fields for this listing.
          </DialogDescription>
        </DialogHeader>

        {business?.slug ? (
          <div className="min-w-0 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <p className="truncate text-xs text-muted-foreground">
              {business.slug}
            </p>
          </div>
        ) : null}

        <form onSubmit={formik.handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-title">Title</Label>
            <Input
              id="business-listing-title"
              name="title"
              autoComplete="off"
              autoFocus
              disabled={submitPending}
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Business name"
              aria-invalid={
                formik.touched.title && formik.errors.title ? true : undefined
              }
            />
            <FieldError
              touched={formik.touched.title}
              error={formik.errors.title}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-email">Email</Label>
            <Input
              id="business-listing-email"
              name="email"
              type="email"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="name@example.com"
              aria-invalid={
                formik.touched.email && formik.errors.email ? true : undefined
              }
            />
            <FieldError
              touched={formik.touched.email}
              error={formik.errors.email}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-website">Website</Label>
            <Input
              id="business-listing-website"
              name="website"
              type="url"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="https://example.com"
              aria-invalid={
                formik.touched.website && formik.errors.website
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.website}
              error={formik.errors.website}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-phone">Phone</Label>
            <Input
              id="business-listing-phone"
              name="phone"
              type="tel"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="(555) 555-5555"
              aria-invalid={
                formik.touched.phone && formik.errors.phone ? true : undefined
              }
            />
            <FieldError
              touched={formik.touched.phone}
              error={formik.errors.phone}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-address">Address</Label>
            <Input
              id="business-listing-address"
              name="address"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="123 Main St, City, ST 12345"
              aria-invalid={
                formik.touched.address && formik.errors.address
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.address}
              error={formik.errors.address}
            />
          </div>

          <div className="grid gap-1.5 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="business-listing-description">
                About description
              </Label>
              <span className="text-xs text-muted-foreground">
                {formik.values.description.length} / {ABOUT_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="business-listing-description"
              name="description"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={5}
              maxLength={ABOUT_MAX_LENGTH}
              placeholder="About text shown on the public business page"
              aria-invalid={
                formik.touched.description && formik.errors.description
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.description}
              error={formik.errors.description}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-title-tag">Title tag</Label>
            <Input
              id="business-listing-title-tag"
              name="title_tag"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.title_tag}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="SEO page title"
              aria-invalid={
                formik.touched.title_tag && formik.errors.title_tag
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.title_tag}
              error={formik.errors.title_tag}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-meta-description">
              Meta description
            </Label>
            <Textarea
              id="business-listing-meta-description"
              name="meta_description"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.meta_description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
              maxLength={200}
              placeholder="SEO meta description"
              aria-invalid={
                formik.touched.meta_description &&
                formik.errors.meta_description
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.meta_description}
              error={formik.errors.meta_description}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-local-note">Local note</Label>
            <Textarea
              id="business-listing-local-note"
              name="local_note"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.local_note}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
              maxLength={500}
              placeholder="Local area note for the listing"
              aria-invalid={
                formik.touched.local_note && formik.errors.local_note
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.local_note}
              error={formik.errors.local_note}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="business-listing-keywords">Keywords</Label>
            <Textarea
              id="business-listing-keywords"
              name="keywords"
              autoComplete="off"
              disabled={submitPending}
              value={formik.values.keywords}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={2}
              placeholder="Comma-separated keywords"
              aria-invalid={
                formik.touched.keywords && formik.errors.keywords
                  ? true
                  : undefined
              }
            />
            <p className="text-xs text-muted-foreground">
              Separate keywords with commas (max 30).
            </p>
            <FieldError
              touched={formik.touched.keywords}
              error={formik.errors.keywords}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={submitPending || !formik.dirty}
              className="cursor-pointer rounded-full"
              onClick={() =>
                formik.resetForm({
                  values: getInitialValues(business),
                })
              }
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
                disabled={submitPending || !formik.dirty}
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
