"use client";

import { useEffect } from "react";
import { useFormik } from "formik";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AFFILIATE_PROVIDER_OPTIONS,
  affiliateProductFormSchema,
  getAffiliateProductFormValues,
} from "@/components/pages/affiliate-programs/affiliateProductForm";

function FieldError({ touched, error }) {
  if (!touched || !error) return null;
  return <p className="text-xs text-destructive">{error}</p>;
}

export default function AffiliateProductAddDialog({
  open,
  onOpenChange,
  onSubmit,
  product = null,
  submitPending = false,
  submitError = null,
}) {
  const isEditing = Boolean(product?.id);
  const formik = useFormik({
    initialValues: getAffiliateProductFormValues(product),
    enableReinitialize: true,
    validationSchema: affiliateProductFormSchema,
    onSubmit: async (values, helpers) => {
      const payload = {
        provider: values.provider,
        title: values.title.trim(),
        description: values.description.trim() || null,
        image_url: values.image_url.trim() || null,
        product_link: values.product_link.trim(),
        affiliate_link: values.affiliate_link.trim(),
      };

      if (isEditing) {
        payload.id = product.id;
      }

      const ok = await onSubmit(payload);
      if (ok && !isEditing) {
        helpers.resetForm();
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm({
        values: getAffiliateProductFormValues(null),
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
          <DialogTitle>
            {isEditing ? "Edit Affiliate Product" : "Add Affiliate Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this affiliate product's details and links."
              : "Create a product for Amazon Associates and other affiliate programs."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="affiliate-provider">Provider</Label>
            <Select
              value={formik.values.provider}
              onValueChange={(value) =>
                formik.setFieldValue("provider", value ?? "amazon")
              }
              disabled={submitPending}
            >
              <SelectTrigger
                id="affiliate-provider"
                className="h-9 w-full"
                aria-invalid={
                  formik.touched.provider && formik.errors.provider
                    ? true
                    : undefined
                }
              >
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {AFFILIATE_PROVIDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              touched={formik.touched.provider}
              error={formik.errors.provider}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="affiliate-title">Title</Label>
            <Input
              id="affiliate-title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={submitPending}
              className="h-9"
              autoComplete="off"
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
            <Label htmlFor="affiliate-description">Description</Label>
            <Textarea
              id="affiliate-description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={submitPending}
              rows={3}
              autoComplete="off"
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
            <Label htmlFor="affiliate-image-url">Image URL</Label>
            <Input
              id="affiliate-image-url"
              name="image_url"
              value={formik.values.image_url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={submitPending}
              className="h-9"
              autoComplete="off"
              placeholder="https://"
              aria-invalid={
                formik.touched.image_url && formik.errors.image_url
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.image_url}
              error={formik.errors.image_url}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="affiliate-product-link">Product link</Label>
            <Input
              id="affiliate-product-link"
              name="product_link"
              value={formik.values.product_link}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={submitPending}
              className="h-9"
              autoComplete="off"
              placeholder="https://www.amazon.com/dp/..."
              aria-invalid={
                formik.touched.product_link && formik.errors.product_link
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.product_link}
              error={formik.errors.product_link}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="affiliate-affiliate-link">Affiliate link</Label>
            <Input
              id="affiliate-affiliate-link"
              name="affiliate_link"
              value={formik.values.affiliate_link}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={submitPending}
              className="h-9"
              autoComplete="off"
              placeholder="https://www.amazon.com/...tag=..."
              aria-invalid={
                formik.touched.affiliate_link && formik.errors.affiliate_link
                  ? true
                  : undefined
              }
            />
            <FieldError
              touched={formik.touched.affiliate_link}
              error={formik.errors.affiliate_link}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitPending}
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitPending}
              className="cursor-pointer"
            >
              {submitPending
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
