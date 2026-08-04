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
});

function getInitialValues(business) {
  return {
    title: business?.title ?? "",
    email: business?.email ?? "",
    website: business?.website ?? "",
    phone: business?.phone ?? "",
    address: business?.address ?? "",
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
      <DialogContent className="sm:max-w-lg" showCloseButton={!submitPending}>
        <DialogHeader>
          <DialogTitle>Edit listing</DialogTitle>
          <DialogDescription>
            Update the business title, contact details, and address.
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
