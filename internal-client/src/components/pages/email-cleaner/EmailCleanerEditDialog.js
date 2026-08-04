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

const emailEditSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

function FieldError({ touched, error }) {
  if (!touched || !error) return null;
  return <p className="text-xs text-destructive">{error}</p>;
}

export default function EmailCleanerEditDialog({
  open,
  onOpenChange,
  business = null,
  onSubmit,
  submitPending = false,
  submitError = null,
}) {
  const formik = useFormik({
    initialValues: {
      email: business?.email ?? "",
    },
    enableReinitialize: true,
    validationSchema: emailEditSchema,
    onSubmit: async (values) => {
      if (!business?.id) return;
      await onSubmit({
        business_id: business.id,
        email: values.email.trim(),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm({
        values: { email: business?.email ?? "" },
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
          <DialogTitle>Edit email</DialogTitle>
          <DialogDescription>
            Update the listing email for this business. A valid email is
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
            <Label htmlFor="email-cleaner-email">Email</Label>
            <Input
              id="email-cleaner-email"
              name="email"
              type="email"
              autoComplete="off"
              autoFocus
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
                  values: { email: business?.email ?? "" },
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
                {submitPending ? "Updating…" : "Update email"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
