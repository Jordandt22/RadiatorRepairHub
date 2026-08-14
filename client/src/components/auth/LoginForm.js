"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/ToastProvider";
import { loginOwner } from "@/lib/api/auth";
import { persistSession } from "@/lib/auth/session";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { usePostHog } from "posthog-js/react";

function safeRedirectPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect")) || "/dashboard";
  const { showCustomError, showCustomSuccess } = useToast();
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data.session) {
          router.replace(redirectTo);
          return;
        }
      } catch {
        // Missing env or client init failure — show the form
      }

      if (mounted) {
        setAuthChecked(true);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [redirectTo, router]);

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password || password.length < 8) {
      next.password = "Password must be at least 8 characters.";
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
      const { data, error } = await loginOwner({
        email: email.trim(),
        password,
      });

      if (error) {
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to sign in. Please try again."
        );
        return;
      }

      if (!data?.session) {
        showCustomError(
          "Signed in, but no session was returned. Please try again."
        );
        return;
      }

      const { error: sessionError } = await persistSession(data.session);
      if (sessionError) {
        showCustomError(
          typeof sessionError.message === "string"
            ? sessionError.message
            : "Unable to save your session. Please try again."
        );
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          posthog?.identify(userData.user.id, {
            email: userData.user.email || email.trim() || undefined,
          });
        }
      } catch {
        // analytics best-effort
      }

      posthog?.capture("owner_login_succeeded", {
        has_claimed_business: Boolean(data.slug),
        redirect_to: data.slug ? `/business/${data.slug}` : redirectTo,
      });

      showCustomSuccess("Signed in successfully.");
      if (data.slug) {
        router.push(`/business/${data.slug}`);
      } else {
        router.push(redirectTo);
      }
    } catch {
      showCustomError("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-center text-sm text-muted-foreground">
          Checking session…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
        Welcome Back!
      </h2>
      <p className="mb-6 text-muted-foreground">
        Sign in with the email and password from your claim to open your
        listing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-1.5">
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-foreground"
          >
            Email <span className="text-destructive">*</span>
          </label>
          <Input
            id="login-email"
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

        <div className="grid gap-1.5">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-foreground"
          >
            Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.password;
                    return next;
                  });
                }
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
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need help claiming a listing?{" "}
        <Link
          href="/how-to-claim"
          className="text-interactive transition-colors hover:underline"
        >
          How to claim
        </Link>
      </p>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
