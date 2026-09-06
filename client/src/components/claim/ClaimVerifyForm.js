"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/contexts/ToastProvider";
import {
  cancelClaimRequest,
  completeClaimRequest,
  resendClaimCode,
} from "@/lib/api/businesses";
import { persistSession } from "@/lib/auth/session";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import {
  getPasswordStrengthError,
  PASSWORD_REQUIREMENTS_HINT,
} from "@/lib/validation/password";
import { usePostHog } from "posthog-js/react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PHONE_CLAIM_RESEND_CONSENT_TEXT } from "@/lib/claimConsent";
import ClaimConsentPolicyLinks from "@/components/businesses/ClaimConsentPolicyLinks";

const RESEND_COOLDOWN_SECONDS = 60;

const EMAIL_RESEND_CONSENT_TEXT =
  "Send a new verification code to this listing's email address.";

function ClaimVerifyFormContent({
  claimRequestId,
  business,
  channel = "email",
  phone = null,
  phoneResendsRemaining = null,
}) {
  const router = useRouter();
  const { showCustomError, showCustomSuccess } = useToast();
  const posthog = usePostHog();
  const { isSignedIn, user, isLoading: isAuthLoading } = useIsSignedIn();
  const isPhoneClaim = channel === "phone";
  const [code, setCode] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendConsent, setResendConsent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendsLeft, setResendsLeft] = useState(
    isPhoneClaim ? Number(phoneResendsRemaining ?? 1) : null
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const capture = (event, props = {}) => {
    posthog?.capture(event, {
      business_id: business?.id || undefined,
      business_slug: business?.slug || undefined,
      business_name: business?.title || undefined,
      signed_in: Boolean(isSignedIn),
      channel: isPhoneClaim ? "phone" : "email",
      source: "claim_verify",
      ...props,
    });
  };

  const identifyOwner = async (fallbackUser) => {
    try {
      let nextUser = fallbackUser;
      if (!nextUser?.id) {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        nextUser = data?.user ?? null;
      }
      if (nextUser?.id) {
        posthog?.identify(nextUser.id, {
          email: nextUser.email || undefined,
        });
      }
    } catch {
      // analytics best-effort
    }
  };

  const goToBusinessPage = (slug) => {
    if (slug) {
      router.push(`/business/${slug}`);
      return;
    }
    router.push("/");
  };

  const handleClaimUnavailable = (error) => {
    const message =
      typeof error?.message === "string"
        ? error.message
        : "This claim request is no longer available.";
    showCustomError(message);
    goToBusinessPage(error?.slug || business.slug);
  };

  const isClaimUnavailableError = (error) =>
    error?.code === "claim-unavailable";

  const validate = () => {
    const next = {};
    if (!code || code.length !== 6) {
      next.code = "Enter the 6-character verification code.";
    }
    if (!isSignedIn) {
      if (isPhoneClaim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
        next.email = "Enter a valid email address for your account.";
      }
      const passwordError = getPasswordStrengthError(password);
      if (passwordError) {
        next.password = passwordError;
      }
      if (password !== confirmPassword) {
        next.confirmPassword = "Passwords must match.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCancel = async () => {
    if (isCanceling || isSubmitting || isResending) return;
    setIsCanceling(true);
    capture("claim_cancel_started");
    try {
      const { data, error } = await cancelClaimRequest(claimRequestId);
      if (error) {
        capture("claim_failed", {
          stage: "cancel",
          error_code: typeof error.code === "string" ? error.code : undefined,
          error_message:
            typeof error.message === "string" ? error.message : undefined,
        });
        if (isClaimUnavailableError(error)) {
          handleClaimUnavailable(error);
          return;
        }
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to cancel the claim request."
        );
        return;
      }
      capture("claim_cancelled");
      goToBusinessPage(data?.slug || business.slug);
    } catch {
      capture("claim_failed", { stage: "cancel" });
      showCustomError("Unable to cancel the claim request.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleResend = async () => {
    if (isResending || isSubmitting || isCanceling) return;
    if (!resendConsent || cooldown > 0) return;
    if (isPhoneClaim && resendsLeft <= 0) return;

    setIsResending(true);
    capture("claim_resend_started");
    try {
      const { data, error } = await resendClaimCode(claimRequestId, true);
      if (error) {
        capture("claim_failed", {
          stage: "resend",
          error_code: typeof error.code === "string" ? error.code : undefined,
          error_message:
            typeof error.message === "string" ? error.message : undefined,
        });
        if (isClaimUnavailableError(error)) {
          handleClaimUnavailable(error);
          return;
        }
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to resend the verification code."
        );
        return;
      }
      setCode("");
      setErrors((prev) => {
        const next = { ...prev };
        delete next.code;
        return next;
      });
      setResendConsent(false);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      if (isPhoneClaim) {
        setResendsLeft(Number(data?.phoneResendsRemaining ?? 0));
      }
      capture("claim_code_resent", {
        phone_resends_remaining: isPhoneClaim
          ? Number(data?.phoneResendsRemaining ?? 0)
          : undefined,
      });
      showCustomSuccess(
        isPhoneClaim
          ? "We're calling the business number again with a new code."
          : "A new verification code has been sent."
      );
    } catch {
      capture("claim_failed", { stage: "resend" });
      showCustomError("Unable to resend the verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isCanceling || isResending || isAuthLoading) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = isSignedIn
        ? {
            claimRequestId,
            code: code.toUpperCase(),
          }
        : {
            claimRequestId,
            code: code.toUpperCase(),
            password,
            confirmPassword,
            // Phone claims have no listing email, so the owner picks their own.
            ...(isPhoneClaim ? { email: loginEmail.trim() } : {}),
          };

      const { data, error } = await completeClaimRequest(payload, {
        authenticated: isSignedIn,
      });

      if (error) {
        if (isClaimUnavailableError(error)) {
          capture("claim_failed", {
            stage: "complete",
            error_code: error.code,
            error_message:
              typeof error.message === "string" ? error.message : undefined,
          });
          handleClaimUnavailable(error);
          return;
        }
        if (error.code === "form-error" && typeof error.message === "object") {
          setErrors(error.message);
        }
        capture("claim_failed", {
          stage: "complete",
          error_code:
            typeof error.code === "string" ? error.code : undefined,
          error_message:
            typeof error.message === "string" ? error.message : undefined,
        });
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to complete your claim. Please try again."
        );
        return;
      }

      if (data?.alreadyAuthenticated) {
        capture("claim_completed", { flow: "signed_in" });
        await identifyOwner(user);
        showCustomSuccess("Your business has been claimed successfully.");
        goToBusinessPage(data?.slug || business.slug);
        return;
      }

      if (data?.session) {
        const { error: sessionError } = await persistSession(data.session);
        if (sessionError) {
          capture("claim_completed", {
            flow: "create_account",
            requires_login: true,
          });
          showCustomSuccess("Your business has been claimed. Please sign in to continue."
          );
          router.push("/signin");
          return;
        }
        capture("claim_completed", { flow: "create_account" });
        await identifyOwner();
        showCustomSuccess("Your business has been claimed successfully.");
        goToBusinessPage(data?.slug || business.slug);
        return;
      }

      if (data?.requiresLogin) {
        capture("claim_completed", {
          flow: "create_account",
          requires_login: true,
        });
        showCustomSuccess(
          typeof data.message === "string"
            ? data.message
            : "Your business has been claimed. Please sign in to continue."
        );
        router.push("/signin");
        return;
      }

      capture("claim_completed", {
        flow: isSignedIn ? "signed_in" : "create_account",
      });
      showCustomSuccess("Your business has been claimed successfully.");
      goToBusinessPage(data?.slug || business.slug);
    } catch {
      capture("claim_failed", { stage: "complete" });
      showCustomError("Unable to complete your claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || isCanceling || isResending || isAuthLoading;

  if (isAuthLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Complete your claim
        </h2>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
        Complete your claim
      </h2>
      <p className="mb-4 text-muted-foreground">
        {isPhoneClaim ? (
          <>
            Enter the 6-digit code from the automated call to claim{" "}
            <span className="font-medium text-foreground">{business.title}</span>.
          </>
        ) : isSignedIn ? (
          <>
            Enter the verification code sent to the listing email to claim{" "}
            <span className="font-medium text-foreground">{business.title}</span>.
          </>
        ) : (
          <>
            Create an account to claim{" "}
            <span className="font-medium text-foreground">{business.title}</span>.
          </>
        )}
      </p>

      {isPhoneClaim ? (
        <div className="mb-6 flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Stay on this page until you finish. If you leave, you&apos;ll need to
            wait for this claim to expire before starting a new one.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">
            Verification code <span className="text-destructive">*</span>
          </label>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={code}
            onChange={(value) => {
              setCode(value.toUpperCase());
              if (errors.code) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.code;
                  return next;
                });
              }
            }}
            disabled={busy}
            aria-invalid={Boolean(errors.code)}
            containerClassName="w-full"
            className="w-full"
          >
            <InputOTPGroup className="w-full">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  aria-invalid={Boolean(errors.code)}
                  className="size-auto h-14 flex-1 text-xl font-semibold"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {errors.code && (
            <p className="text-xs text-destructive">{errors.code}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {isPhoneClaim
              ? "This code expires in about 10 minutes."
              : "This code expires in 1 hour."}
          </p>
        </div>

        <div className="grid gap-2 rounded-md border border-border p-4">
          <p className="text-sm font-medium text-foreground">
            {isPhoneClaim ? "Didn't get the call?" : "Didn't get the code?"}
          </p>
          {isPhoneClaim && resendsLeft <= 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                You&apos;ve used your one repeat call for this claim.
              </p>
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-xs text-foreground">
                <p>
                  If you still didn&apos;t receive it or the code expired, wait for this claim request to
                  expire (1 hr after starting this attempt) and start again
                  from the listing, or{" "}
                  <Link
                    href="/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-interactive underline underline-offset-2"
                  >
                    contact support
                  </Link>
                  .
                </p>
              </div>
            </div>
          ) : (
            <>
              {isPhoneClaim ? (
                <p className="text-xs text-muted-foreground">
                  You have {resendsLeft} repeat call left for this claim. After
                  that, you&apos;ll need to wait for the claim to expire or contact
                  support if the call still doesn&apos;t come through.
                </p>
              ) : null}
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                    checked={resendConsent}
                    onChange={(event) => setResendConsent(event.target.checked)}
                    disabled={busy}
                  />
                  <span className="text-xs leading-relaxed">
                    {isPhoneClaim
                      ? PHONE_CLAIM_RESEND_CONSENT_TEXT
                      : EMAIL_RESEND_CONSENT_TEXT}
                  </span>
                </label>
                {isPhoneClaim ? <ClaimConsentPolicyLinks /> : null}
              </div>
              <div>
                <Button
                  type="button"
                  className="mt-1"
                  disabled={busy || !resendConsent || cooldown > 0}
                  onClick={handleResend}
                >
                  {isResending
                    ? isPhoneClaim
                      ? "Calling..."
                      : "Sending..."
                    : cooldown > 0
                      ? `Wait ${cooldown}s`
                      : isPhoneClaim
                        ? "Call me again"
                        : "Resend code"}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="claim-destination"
            className="text-sm font-medium text-foreground"
          >
            {isPhoneClaim ? "Listing phone" : "Listing email"}{" "}
            <span className="text-destructive">*</span>
          </label>
          <Input
            id="claim-destination"
            type={isPhoneClaim ? "tel" : "email"}
            value={(isPhoneClaim ? phone : business.email) ?? ""}
            readOnly
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            {isPhoneClaim
              ? "We call this number to read your verification code. It never asks for personal or payment information."
              : isSignedIn
                ? "Verification code is sent to this listing email. Your login email stays the same."
                : "Email can be changed after account creation"}
          </p>
        </div>

        {isSignedIn && user?.email ? (
          <div className="grid gap-1.5">
            <label
              htmlFor="claim-account-email"
              className="text-sm font-medium text-foreground"
            >
              Signed in as
            </label>
            <Input
              id="claim-account-email"
              type="email"
              value={user.email}
              readOnly
              disabled
              className="bg-muted"
            />
          </div>
        ) : null}

        {!isSignedIn ? (
          <>
            {isPhoneClaim ? (
              <div className="grid gap-1.5">
                <label
                  htmlFor="claim-login-email"
                  className="text-sm font-medium text-foreground"
                >
                  Your email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="claim-login-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
                  disabled={busy}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="you@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  This becomes the login email for your owner account.
                </p>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            ) : null}

            <div className="grid gap-1.5">
              <label
                htmlFor="claim-password"
                className="text-sm font-medium text-foreground"
              >
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="claim-password"
                  type={showPassword ? "text" : "password"}
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
                  disabled={busy}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={busy}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {PASSWORD_REQUIREMENTS_HINT}
              </p>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="claim-confirm-password"
                className="text-sm font-medium text-foreground"
              >
                Confirm password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="claim-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.confirmPassword;
                        return next;
                      });
                    }
                  }}
                  disabled={busy}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={busy}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-interactive underline transition-colors hover:text-interactive/80"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-interactive underline transition-colors hover:text-interactive/80"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            className="px-8"
            disabled={busy}
            onClick={handleCancel}
          >
            {isCanceling ? "Canceling..." : "Cancel"}
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={busy}
          >
            {isSubmitting
              ? isSignedIn
                ? "Claiming..."
                : "Creating account..."
              : isSignedIn
                ? "Claim business"
                : "Create account"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ClaimVerifyForm(props) {
  return <ClaimVerifyFormContent {...props} />;
}

