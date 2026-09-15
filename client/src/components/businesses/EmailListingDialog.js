"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { Bookmark } from "lucide-react";
import { usePostHog } from "posthog-js/react";
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
import Link from "next/link";
import { useToast } from "@/contexts/ToastProvider";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { submitListingSave } from "@/lib/api/listing-saves";

const SUBMIT_DEBOUNCE_MS = 400;

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

export default function EmailListingDialog({
  businessId,
  businessName,
  triggerClassName,
  placement = "hero",
}) {
  const posthog = usePostHog();
  const { showCustomSuccess, showCustomError } = useToast();
  const { user } = useIsSignedIn();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const accountEmail =
      typeof user?.email === "string" ? user.email.trim() : "";
    if (accountEmail) {
      setEmail((prev) => prev || accountEmail);
    }
  }, [open, user?.email]);

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    return next;
  };

  const submitSave = async () => {
    if (isSubmitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await submitListingSave({
        businessId,
        email: email.trim(),
        name: name.trim() || undefined,
      });

      if (error) {
        const fieldErrors = mapApiErrorsToFields(error);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          showCustomError(
            error.message || "Unable to email this listing. Please try again."
          );
        }
        posthog?.capture("business_listing_save_failed", {
          business_id: businessId || undefined,
          business_name: businessName || undefined,
          placement,
          error_code: error.code || undefined,
        });
        return;
      }

      posthog?.capture("business_listing_save_submitted", {
        business_id: businessId || undefined,
        business_name: businessName || undefined,
        placement,
      });
      showCustomSuccess("Listing emailed. Check your inbox.");
      setOpen(false);
      setEmail("");
      setName("");
      setErrors({});
    } catch {
      showCustomError("Unable to email this listing. Please try again.");
      posthog?.capture("business_listing_save_failed", {
        business_id: businessId || undefined,
        business_name: businessName || undefined,
        placement,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSaveRef = useRef(submitSave);
  submitSaveRef.current = submitSave;

  const debouncedSubmit = useMemo(
    () =>
      debounce(
        () => {
          submitSaveRef.current?.();
        },
        SUBMIT_DEBOUNCE_MS,
        { leading: true, trailing: false }
      ),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSubmit.cancel();
    };
  }, [debouncedSubmit]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (Object.keys(validate()).length > 0) {
      setErrors(validate());
      return;
    }
    debouncedSubmit();
  };

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      debouncedSubmit.cancel();
      setErrors({});
    } else {
      posthog?.capture("business_listing_save_opened", {
        business_id: businessId || undefined,
        business_name: businessName || undefined,
        placement,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<button type="button" className={triggerClassName} />}
      >
        <Bookmark className="size-4 shrink-0" aria-hidden="true" />
        Save
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Email yourself this listing</DialogTitle>
          <DialogDescription>
            We&apos;ll send a link to{" "}
            <span className="font-medium text-foreground">
              {businessName || "this shop"}
            </span>{" "}
            so you can find it later. Limited to once per shop per day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="listing-save-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="listing-save-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }
              }}
              disabled={isSubmitting}
              placeholder="you@example.com"
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="listing-save-name" className="text-sm font-medium">
              Name <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="listing-save-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Your name"
            />
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            By emailing this listing to yourself, you agree to our{" "}
            <Link
              href="/terms"
              className="text-interactive hover:text-primary underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-interactive hover:text-primary underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Email listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
