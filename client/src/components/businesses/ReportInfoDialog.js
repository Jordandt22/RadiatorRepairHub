"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/contexts/ToastProvider";
import { submitListingReport } from "@/lib/api/listing-reports";

const REASON_OPTIONS = [
  {
    value: "wrong_claim_contact",
    label: "Contact info is wrong, I own this business and can't claim it",
  },
  {
    value: "inappropriate",
    label: "Inappropriate or misleading listing content",
  },
];

const INITIAL_FORM = {
  reason: "wrong_claim_contact",
  reporterName: "",
  reporterEmail: "",
  details: "",
  suggestedPhone: "",
  suggestedEmail: "",
};

function isValidPhone(value) {
  if (!value?.trim()) return true;
  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
}

function isValidEmail(value) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
    value
  );
}

function mapApiErrorsToFields(error) {
  if (!error) return {};
  if (error.message && typeof error.message === "object") {
    return error.message;
  }
  return {};
}

function ReportInfoDialog({ businessId, businessName }) {
  const { showCustomSuccess, showCustomError } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!form.reason) next.reason = "Please select a reason.";
    if (!form.reporterEmail.trim()) {
      next.reporterEmail = "Email is required.";
    } else if (!isValidEmail(form.reporterEmail.trim())) {
      next.reporterEmail = "Please enter a valid email address.";
    }
    if (form.details.trim().length < 10) {
      next.details = "Please provide at least 10 characters of detail.";
    }
    if (form.suggestedPhone && !isValidPhone(form.suggestedPhone)) {
      next.suggestedPhone = "Please enter a valid phone number.";
    }
    if (
      form.suggestedEmail.trim() &&
      !isValidEmail(form.suggestedEmail.trim())
    ) {
      next.suggestedEmail = "Please enter a valid email address.";
    }
    return next;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        businessId,
        reason: form.reason,
        details: form.details.trim(),
        reporterEmail: form.reporterEmail.trim(),
        reporterName: form.reporterName.trim() || undefined,
      };

      if (form.reason === "wrong_claim_contact") {
        if (form.suggestedPhone.trim()) {
          payload.suggestedPhone = form.suggestedPhone.trim();
        }
        if (form.suggestedEmail.trim()) {
          payload.suggestedEmail = form.suggestedEmail.trim();
        }
      }

      const { data, error } = await submitListingReport(payload);

      if (error) {
        const fieldErrors = mapApiErrorsToFields(error);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          showCustomError(
            typeof error.message === "string"
              ? error.message
              : "Unable to submit your report. Please try again."
          );
        }
        return;
      }

      showCustomSuccess(
        data?.message ||
        "Thanks! We received your report and will review it soon."
      );
      resetForm();
      setOpen(false);
    } catch {
      showCustomError("Unable to submit your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) return;
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 hover:scale-95 cursor-pointer"
          />
        }
      >
        <Flag className="size-4" />
        Report Info
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report listing info</DialogTitle>
          <DialogDescription>
            Tell us what&apos;s wrong with
            {businessName ? ` ${businessName}` : " this listing"}. We review
            every report manually and will follow up by email when needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-800">
              What&apos;s wrong?
            </legend>
            <RadioGroup
              value={form.reason}
              onValueChange={(value) => {
                setForm((prev) => ({ ...prev, reason: value }));
                clearFieldError("reason");
              }}
              className="gap-2"
            >
              {REASON_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>
            {errors.reason ? (
              <p className="text-xs text-red-600">{errors.reason}</p>
            ) : null}
          </fieldset>

          <div className="space-y-1.5">
            <label
              htmlFor="listing-report-name"
              className="text-sm font-medium text-gray-800"
            >
              Your name
            </label>
            <Input
              id="listing-report-name"
              value={form.reporterName}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  reporterName: e.target.value,
                }));
                clearFieldError("reporterName");
              }}
              placeholder="Optional"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="listing-report-email"
              className="text-sm font-medium text-gray-800"
            >
              Your email <span className="text-red-500">*</span>
            </label>
            <Input
              id="listing-report-email"
              type="email"
              value={form.reporterEmail}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  reporterEmail: e.target.value,
                }));
                clearFieldError("reporterEmail");
              }}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.reporterEmail)}
            />
            {errors.reporterEmail ? (
              <p className="text-xs text-red-600">{errors.reporterEmail}</p>
            ) : null}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {form.reason === "wrong_claim_contact" ? (
              <motion.div
                key="wrong-claim-fields"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="listing-report-suggested-phone"
                    className="text-sm font-medium text-gray-800"
                  >
                    Correct phone
                  </label>
                  <Input
                    id="listing-report-suggested-phone"
                    type="tel"
                    value={form.suggestedPhone}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        suggestedPhone: e.target.value,
                      }));
                      clearFieldError("suggestedPhone");
                    }}
                    placeholder="Optional"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.suggestedPhone)}
                  />
                  {errors.suggestedPhone ? (
                    <p className="text-xs text-red-600">{errors.suggestedPhone}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="listing-report-suggested-email"
                    className="text-sm font-medium text-gray-800"
                  >
                    Correct email
                  </label>
                  <Input
                    id="listing-report-suggested-email"
                    type="email"
                    value={form.suggestedEmail}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        suggestedEmail: e.target.value,
                      }));
                      clearFieldError("suggestedEmail");
                    }}
                    placeholder="Optional"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.suggestedEmail)}
                  />
                  {errors.suggestedEmail ? (
                    <p className="text-xs text-red-600">{errors.suggestedEmail}</p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label
              htmlFor="listing-report-details"
              className="text-sm font-medium text-gray-800"
            >
              Details <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="listing-report-details"
              value={form.details}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, details: e.target.value }));
                clearFieldError("details");
              }}
              placeholder="Describe what's wrong…"
              rows={4}
              aria-invalid={Boolean(errors.details)}
            />
            {errors.details ? (
              <p className="text-xs text-red-600">{errors.details}</p>
            ) : null}
          </div>

          {errors.form ? (
            <p className="text-xs text-red-600">{errors.form}</p>
          ) : null}

          <p className="text-xs text-gray-500 leading-relaxed">
            By submitting this report, you agree to our{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReportInfoDialog;
