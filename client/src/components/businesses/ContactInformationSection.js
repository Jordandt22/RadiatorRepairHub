"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import Link from "next/link";
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
import { ToastProvider, useToast } from "@/contexts/ToastProvider";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import BusinessContactLinks from "@/components/businesses/BusinessContactLinks";
import QuickContactDialog from "@/components/businesses/QuickContactDialog";
import { updateBusinessContact } from "@/lib/api/businessContact";

function isValidPhone(value) {
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

function isValidWebsite(value) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function mapApiErrorsToFields(error) {
  const message = error?.message;
  if (message && typeof message === "object" && !Array.isArray(message)) {
    const next = {};
    if (typeof message.phone === "string") next.phone = message.phone;
    if (typeof message.email === "string") next.email = message.email;
    if (typeof message.website === "string") next.website = message.website;
    if (Object.keys(next).length > 0) return next;
  }

  if (typeof message === "string") {
    const lower = message.toLowerCase();
    if (lower.includes("phone")) return { phone: message };
    if (lower.includes("email")) return { email: message };
    if (lower.includes("website") || lower.includes("url")) {
      return { website: message };
    }
    return { form: message };
  }

  return { form: "Unable to update contact information." };
}

function ContactInformationSectionContent({
  businessId,
  businessName,
  phone: initialPhone,
  email: initialEmail,
  website: initialWebsite,
}) {
  const router = useRouter();
  const { showCustomSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(initialPhone || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [website, setWebsite] = useState(initialWebsite || "");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPhone(initialPhone || "");
    setEmail(initialEmail || "");
    setWebsite(initialWebsite || "");
    setErrors({});
  }, [open, initialPhone, initialEmail, initialWebsite]);

  const normalize = (value) => (typeof value === "string" ? value.trim() : "");
  const hasChanges =
    normalize(phone) !== normalize(initialPhone) ||
    normalize(email) !== normalize(initialEmail) ||
    normalize(website) !== normalize(initialWebsite);

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
    if (!phone.trim()) {
      next.phone = "Phone number is required.";
    } else if (!isValidPhone(phone)) {
      next.phone = "Please enter a valid phone number.";
    }
    if (email.trim() && !isValidEmail(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (website.trim() && !isValidWebsite(website)) {
      next.website = "Please enter a valid website URL.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !hasChanges) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const { data, error } = await updateBusinessContact({
        businessId,
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
      });

      if (error) {
        setErrors(mapApiErrorsToFields(error));
        return;
      }

      showCustomSuccess("Contact information updated.");
      setOpen(false);
      if (data?.phone != null) setPhone(data.phone || "");
      if (data?.email !== undefined) setEmail(data.email || "");
      if (data?.website !== undefined) setWebsite(data.website || "");
      router.refresh();
    } catch {
      setErrors({ form: "Unable to update contact information." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-3 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-2">
      <BusinessSectionHeader
        title="Contact Information"
        businessId={businessId}
        onEdit={() => setOpen(true)}
      />

      <BusinessContactLinks
        businessId={businessId}
        businessName={businessName}
        phone={initialPhone}
        email={initialEmail}
        website={initialWebsite}
      />

      <div className="mt-4 md:mt-5 space-y-3">
        <QuickContactDialog
          businessId={businessId}
          businessName={businessName}
          email={initialEmail}
          phone={initialPhone}
        />
        <Link
          href="/contact"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Flag className="size-4" />
          Report Info
        </Link>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>
              Update the phone, email, and website shown on your listing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="owner-contact-phone"
                className="text-sm font-medium text-gray-800"
              >
                Phone number <span className="text-red-500">*</span>
              </label>
              <Input
                id="owner-contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError("phone");
                }}
                placeholder="(555) 123-4567"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone ? (
                <p className="text-xs text-red-600">{errors.phone}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="owner-contact-email"
                className="text-sm font-medium text-gray-800"
              >
                Email
              </label>
              <Input
                id="owner-contact-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              <p className="text-xs text-gray-500">
                This email is for display and not sign in.
              </p>
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="owner-contact-website"
                className="text-sm font-medium text-gray-800"
              >
                Website URL
              </label>
              <Input
                id="owner-contact-website"
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  clearFieldError("website");
                }}
                placeholder="https://example.com"
                autoComplete="url"
                aria-invalid={Boolean(errors.website)}
              />
              {errors.website ? (
                <p className="text-xs text-red-600">{errors.website}</p>
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
                disabled={isSubmitting || !hasChanges}
                className="bg-blue-600 hover:bg-blue-700"
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

export default function ContactInformationSection(props) {
  return (
    <ToastProvider>
      <ContactInformationSectionContent {...props} />
    </ToastProvider>
  );
}
