"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/ToastProvider";
import { requestPasswordReset } from "@/lib/api/auth";
import { usePostHog } from "posthog-js/react";

export default function ForgotPasswordForm() {
  const { showCustomError } = useToast();
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
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
      const { error } = await requestPasswordReset({
        email: email.trim().toLowerCase(),
      });

      if (error) {
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to send a reset link. Please try again."
        );
        return;
      }

      posthog?.capture("owner_password_reset_requested");
      setSent(true);
    } catch {
      showCustomError("Unable to send a reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Check your inbox
        </h2>
        <p className="mb-6 text-muted-foreground">
          If an account exists for that email, we sent a reset link. It may take
          a few minutes to arrive. Check spam if you do not see it.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
        Forgot your password?
      </h2>
      <p className="mb-6 text-muted-foreground">
        Enter the owner email you used to claim your listing. We will send a
        reset link if an account exists.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-1.5">
          <label
            htmlFor="forgot-email"
            className="text-sm font-medium text-foreground"
          >
            Email <span className="text-destructive">*</span>
          </label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }
            }}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link
          href="/signin"
          className="text-interactive transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
