"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/ToastProvider";
import {
  cleanAuthParamsFromUrl,
  getAuthRedirectError,
  hydrateSessionFromRedirect,
} from "@/lib/auth/redirectSession";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  getPasswordStrengthError,
  PASSWORD_REQUIREMENTS_HINT,
} from "@/lib/validation/password";
import { usePostHog } from "posthog-js/react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { showCustomError, showCustomSuccess } = useToast();
  const posthog = usePostHog();
  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const redirectError = getAuthRedirectError();
      if (redirectError) {
        cleanAuthParamsFromUrl();
        if (mounted) setStatus("invalid");
        return;
      }

      await hydrateSessionFromRedirect();
      if (!mounted) return;

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          setStatus("invalid");
          return;
        }
        setStatus("ready");
      } catch {
        if (mounted) setStatus("invalid");
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const clearFieldError = (field) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!password) {
      next.password = "New password is required.";
    } else {
      const strengthError = getPasswordStrengthError(password);
      if (strengthError) {
        next.password = strengthError;
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
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        showCustomError(
          typeof error.message === "string" && error.message.trim()
            ? error.message
            : "Unable to update password. Please try again."
        );
        return;
      }

      posthog?.capture("owner_password_reset_completed");
      showCustomSuccess("Your password has been updated.");
      router.push("/dashboard");
    } catch {
      showCustomError("Unable to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-center text-sm text-muted-foreground">
          Checking reset link…
        </p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Reset link expired
        </h2>
        <p className="mb-6 text-muted-foreground">
          This password reset link is invalid or has expired. Request a new
          link to choose a password.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
        Choose a new password
      </h2>
      <p className="mb-6 text-muted-foreground">
        Enter a new password for your owner account, then sign in to manage
        your listing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-1.5">
          <label
            htmlFor="reset-password"
            className="text-sm font-medium text-foreground"
          >
            New password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter a new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {PASSWORD_REQUIREMENTS_HINT}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="reset-confirm-password"
            className="text-sm font-medium text-foreground"
          >
            Confirm password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              id="reset-confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError("confirmPassword");
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.confirmPassword)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Saving..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
