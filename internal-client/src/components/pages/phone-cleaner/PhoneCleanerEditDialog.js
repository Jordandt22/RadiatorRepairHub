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

const phoneEditSchema = Yup.object({
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .test("valid-phone", "Please enter a valid phone number", isValidPhone),
});

function FieldError({ touched, error }) {
  if (!touched || !error) return null;
  return <p className="text-xs text-destructive">{error}</p>;
}

export default function PhoneCleanerEditDialog({
  open,
  onOpenChange,
  business = null,
  onSubmit,
  submitPending = false,
  submitError = null,
}) {
  const formik = useFormik({
    initialValues: {
      phone: business?.phone ?? "",
    },
    enableReinitialize: true,
    validationSchema: phoneEditSchema,
    onSubmit: async (values) => {
      if (!business?.id) return;
      await onSubmit({
        business_id: business.id,
        phone: values.phone.trim(),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm({
        values: { phone: business?.phone ?? "" },
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
      <DialogContent className="sm:max-w-md" showCloseButton={!submitPending}>
        <DialogHeader>
          <DialogTitle>Edit phone</DialogTitle>
          <DialogDescription>
            Update the listing phone for this business. A valid phone number is
            required.
          </DialogDescription>
        </DialogHeader>

        {business ? (
          <div className="min-w-0 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <p className="truncate text-sm font-medium">
              {business.title ?? "—"}
            </p>
            {business.slug ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {business.slug}
              </p>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={formik.handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="phone-cleaner-phone">Phone</Label>
            <Input
              id="phone-cleaner-phone"
              name="phone"
              type="tel"
              autoComplete="off"
              autoFocus
              disabled={submitPending}
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="(555) 123-4567"
              aria-invalid={
                formik.touched.phone && formik.errors.phone ? true : undefined
              }
            />
            <FieldError
              touched={formik.touched.phone}
              error={formik.errors.phone}
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
                  values: { phone: business?.phone ?? "" },
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
                {submitPending ? "Updating…" : "Update phone"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
