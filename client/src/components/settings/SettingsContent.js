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
import OwnerEditButton from "@/components/businesses/OwnerEditButton";
import { ToastProvider, useToast } from "@/contexts/ToastProvider";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { updateOwnerEmail } from "@/lib/api/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function isValidEmail(value) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
    value
  );
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      Pending
    </span>
  );
}

function AccountEmailSection({
  currentEmail,
  pendingEmail,
  onEmailChangeRequested,
}) {
  const { showCustomSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(currentEmail || "");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail(pendingEmail || currentEmail || "");
    setErrors({});
  }, [open, currentEmail, pendingEmail]);

  const normalize = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";
  const hasChanges = normalize(email) !== normalize(currentEmail);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !hasChanges) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setErrors({ email: "Email is required." });
      return;
    }
    if (!isValidEmail(trimmed)) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const { data, error } = await updateOwnerEmail({ email: trimmed });
      if (error) {
        setErrors({
          form:
            typeof error.message === "string"
              ? error.message
              : "Unable to update email.",
        });
        return;
      }

      showCustomSuccess(
        data?.message ||
          "Confirmation emails sent. Check your current and new inbox to finish the change."
      );
      setOpen(false);
      if (typeof onEmailChangeRequested === "function") {
        await onEmailChangeRequested(data?.newEmail || trimmed);
      }
    } catch {
      setErrors({ form: "Unable to update email." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-semibold text-gray-900">
              Email
            </h3>
            {pendingEmail ? <PendingBadge /> : null}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {currentEmail || "No email on file"}
          </p>
          {pendingEmail ? (
            <p className="mt-1 text-xs text-amber-700">
              Confirming change to {pendingEmail}. Check both inboxes and click
              the confirmation links.
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-500">
              Changing your email sends confirmation links to your current and
              new addresses.
            </p>
          )}
        </div>
        <OwnerEditButton
          aria-label="Edit email"
          onClick={() => setOpen(true)}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>
              We will email both your current and new address to confirm this
              change.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="settings-email"
                className="text-sm font-medium text-gray-800"
              >
                New email
              </label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email}</p>
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
    </section>
  );
}

function AccountPasswordSection() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-gray-900">
            Password
          </h3>
          <p className="mt-1 text-sm tracking-widest text-gray-600">••••••••</p>
          <p className="mt-2 text-xs text-gray-500">
            Password changes are coming soon.
          </p>
        </div>
        <OwnerEditButton
          aria-label="Edit password (coming soon)"
          disabled
          onClick={() => {}}
        />
      </div>
    </section>
  );
}

function AccountSettingsPanel({
  currentEmail,
  pendingEmail,
  onEmailChangeRequested,
}) {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <AccountEmailSection
        currentEmail={currentEmail}
        pendingEmail={pendingEmail}
        onEmailChangeRequested={onEmailChangeRequested}
      />
      <AccountPasswordSection />
      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          disabled
          className="border-red-200 text-red-700 disabled:opacity-60"
        >
          Delete account
        </Button>
        <p className="mt-2 text-xs text-gray-500">
          Account deletion is coming soon.
        </p>
      </div>
    </div>
  );
}

function SettingsContentInner() {
  const { user, refreshUser } = useIsSignedIn();
  const [pendingOverride, setPendingOverride] = useState("");

  useEffect(() => {
    // Always re-fetch from Auth on Settings mount (covers email-confirm redirects).
    refreshUser();
  }, [refreshUser]);

  const currentEmail =
    typeof user?.email === "string" ? user.email.trim() : "";
  const pendingFromUser =
    typeof user?.new_email === "string" ? user.new_email.trim() : "";
  const pendingEmail = pendingFromUser || pendingOverride;

  const handleEmailChangeRequested = async (requestedEmail) => {
    if (requestedEmail) {
      setPendingOverride(
        typeof requestedEmail === "string" ? requestedEmail.trim() : ""
      );
    }
    const freshUser = await refreshUser();
    if (freshUser?.new_email) {
      setPendingOverride("");
    }
  };

  useEffect(() => {
    if (pendingFromUser) {
      setPendingOverride("");
    }
    if (!pendingFromUser && currentEmail && pendingOverride) {
      // Change completed — clear optimistic pending once emails match.
      if (
        currentEmail.trim().toLowerCase() ===
        pendingOverride.trim().toLowerCase()
      ) {
        setPendingOverride("");
      }
    }
  }, [pendingFromUser, currentEmail, pendingOverride]);

  const tabsTriggerClassNames =
    "px-6 cursor-pointer hover:translate-y-[-2px] transition-all duration-300";

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account and notification preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="gap-6">
        <TabsList>
          <TabsTrigger value="account" className={tabsTriggerClassNames}>
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className={tabsTriggerClassNames}>
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <section aria-labelledby="account-settings-heading">
            <h2 id="account-settings-heading" className="sr-only">
              Account
            </h2>
            <AccountSettingsPanel
              currentEmail={currentEmail}
              pendingEmail={pendingEmail}
              onEmailChangeRequested={handleEmailChangeRequested}
            />
          </section>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
            <p className="font-medium text-gray-900">Coming soon</p>
            <p className="mt-1 text-sm text-gray-600">
              Choose how you hear about inquiries and account updates.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsContent() {
  return (
    <ToastProvider>
      <SettingsContentInner />
    </ToastProvider>
  );
}
