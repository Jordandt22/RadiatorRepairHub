"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import OwnerEditButton from "@/components/businesses/OwnerEditButton";
import { useToast } from "@/contexts/ToastProvider";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { signOut } from "@/lib/auth/session";
import {
  updateOwnerEmail,
  updateOwnerPassword,
  deleteOwnerAccount,
} from "@/lib/api/auth";
import {
  getPasswordStrengthError,
  PASSWORD_REQUIREMENTS_HINT,
} from "@/lib/validation/password";
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

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  showPassword,
  onToggleShow,
  disabled,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
          onClick={onToggleShow}
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
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
        data?.message ||"Confirmation emails sent. Check your current and new inbox to finish the change."
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
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-semibold text-foreground">
              Email
            </h3>
            {pendingEmail ? <PendingBadge /> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentEmail || "No email on file"}
          </p>
          {pendingEmail ? (
            <p className="mt-1 text-xs text-amber-700">
              Confirming change to {pendingEmail}. Check both inboxes and click
              the confirmation links.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              This email is only for signing in, not displayed on your business
              page.
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
                className="text-sm font-medium text-foreground"
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
  const { showCustomSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrors({});
  }, [open]);

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
    if (!currentPassword) {
      next.currentPassword = "Current password is required.";
    }
    if (!password) {
      next.password = "New password is required.";
    } else {
      const strengthError = getPasswordStrengthError(password);
      if (strengthError) {
        next.password = strengthError;
      } else if (password === currentPassword) {
        next.password ="New password must be different from your current password.";
      }
    }
    if (!confirmPassword) {
      next.confirmPassword = "Confirm your new password.";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const { data, error } = await updateOwnerPassword({
        currentPassword,
        password,
        confirmPassword,
      });

      if (error) {
        const message =
          typeof error.message === "string"
            ? error.message
            : "Unable to update password.";
        const lower = message.toLowerCase();
        if (
          lower.includes("current password") ||
          lower.includes("incorrect")
        ) {
          setErrors({ currentPassword: message });
        } else {
          setErrors({ form: message });
        }
        return;
      }

      showCustomSuccess(data?.message || "Your password has been updated.");
      setOpen(false);
    } catch {
      setErrors({ form: "Unable to update password." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            Password
          </h3>
          <p className="mt-1 text-sm tracking-widest text-muted-foreground">••••••••</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Choose a strong password you don&apos;t use elsewhere.
          </p>
        </div>
        <OwnerEditButton
          aria-label="Edit password"
          onClick={() => setOpen(true)}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter your current password, then choose a new one.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              id="settings-current-password"
              label="Current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                clearFieldError("currentPassword");
              }}
              autoComplete="current-password"
              error={errors.currentPassword}
              showPassword={showCurrent}
              onToggleShow={() => setShowCurrent((prev) => !prev)}
              disabled={isSubmitting}
            />
            <PasswordField
              id="settings-new-password"
              label="New password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              autoComplete="new-password"
              error={errors.password}
              showPassword={showNew}
              onToggleShow={() => setShowNew((prev) => !prev)}
              disabled={isSubmitting}
            />
            {!errors.password ? (
              <p className="-mt-2 text-xs text-muted-foreground">
                {PASSWORD_REQUIREMENTS_HINT}
              </p>
            ) : null}
            <PasswordField
              id="settings-confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError("confirmPassword");
              }}
              autoComplete="new-password"
              error={errors.confirmPassword}
              showPassword={showConfirm}
              onToggleShow={() => setShowConfirm((prev) => !prev)}
              disabled={isSubmitting}
            />

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
                disabled={isSubmitting}
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

function AccountDeleteSection() {
  const router = useRouter();
  const { showCustomSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");
    try {
      const { data, error: apiError } = await deleteOwnerAccount();
      if (apiError) {
        setError(
          typeof apiError.message === "string"
            ? apiError.message
            : "Unable to delete your account."
        );
        return;
      }

      await signOut();
      showCustomSuccess(data?.message || "Your account has been deleted.");
      setOpen(false);
      router.replace("/");
    } catch {
      setError("Unable to delete your account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
      >
        Delete Account
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Deletes your login account only. Your business listing information stays
        on RadiatorRepairHub, but listings you own become unclaimed.
      </p>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isDeleting) return;
          setOpen(nextOpen);
          if (!nextOpen) setError("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Deletion</DialogTitle>
            <DialogDescription>
              This deletes your RadiatorRepairHub account only, not your
              business listing information. Listings you own will become
              unclaimed. This can NOT be reverted.
            </DialogDescription>
          </DialogHeader>

          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
      <AccountDeleteSection />
    </div>
  );
}

function SettingsAccountSkeleton() {
  return (
    <div
      className="flex max-w-xl flex-col gap-4"
      aria-busy="true"
      aria-label="Loading account settings"
    >
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-4 w-52 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="size-9 shrink-0 rounded-lg" />
        </div>
      </section>
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>
          <Skeleton className="size-9 shrink-0 rounded-lg" />
        </div>
      </section>
      <div className="pt-2">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="mt-2 h-3 w-48 rounded-md" />
      </div>
    </div>
  );
}

function SettingsContentInner() {
  const { user, isLoading, refreshUser } = useIsSignedIn();
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

  const tabsTriggerClassNames ="px-6 cursor-pointer transition-colors duration-200";

  const showAccountSkeleton = isLoading || !user;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
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
            {showAccountSkeleton ? (
              <SettingsAccountSkeleton />
            ) : (
              <AccountSettingsPanel
                currentEmail={currentEmail}
                pendingEmail={pendingEmail}
                onEmailChangeRequested={handleEmailChangeRequested}
              />
            )}
          </section>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how you hear about inquiries and account updates.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsContent() {
  return <SettingsContentInner />;
}
