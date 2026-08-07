"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ToastProvider, useToast } from "@/contexts/ToastProvider";
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

function ClaimVerifyFormContent({ claimRequestId, business }) {
  const router = useRouter();
  const { showCustomError, showCustomSuccess } = useToast();
  const { isSignedIn, user, isLoading: isAuthLoading } = useIsSignedIn();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState({});

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
    try {
      const { data, error } = await cancelClaimRequest(claimRequestId);
      if (error) {
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
      goToBusinessPage(data?.slug || business.slug);
    } catch {
      showCustomError("Unable to cancel the claim request.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleResend = async () => {
    if (isResending || isSubmitting || isCanceling) return;
    setIsResending(true);
    try {
      const { error } = await resendClaimCode(claimRequestId);
      if (error) {
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
      showCustomSuccess("A new verification code has been sent.");
    } catch {
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
          };

      const { data, error } = await completeClaimRequest(payload, {
        authenticated: isSignedIn,
      });

      if (error) {
        if (isClaimUnavailableError(error)) {
          handleClaimUnavailable(error);
          return;
        }
        if (error.code === "form-error" && typeof error.message === "object") {
          setErrors(error.message);
        }
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to complete your claim. Please try again."
        );
        return;
      }

      if (data?.alreadyAuthenticated) {
        showCustomSuccess("Your business has been claimed successfully.");
        goToBusinessPage(data?.slug || business.slug);
        return;
      }

      if (data?.session) {
        const { error: sessionError } = await persistSession(data.session);
        if (sessionError) {
          showCustomSuccess(
            "Your business has been claimed. Please sign in to continue."
          );
          router.push("/signin");
          return;
        }
        showCustomSuccess("Your business has been claimed successfully.");
        goToBusinessPage(data?.slug || business.slug);
        return;
      }

      if (data?.requiresLogin) {
        showCustomSuccess(
          typeof data.message === "string"
            ? data.message
            : "Your business has been claimed. Please sign in to continue."
        );
        router.push("/signin");
        return;
      }

      showCustomSuccess("Your business has been claimed successfully.");
      goToBusinessPage(data?.slug || business.slug);
    } catch {
      showCustomError("Unable to complete your claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || isCanceling || isResending || isAuthLoading;

  if (isAuthLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border-t-5 border-blue-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
          Complete your claim
        </h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-t-5 border-blue-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
        Complete your claim
      </h2>
      <p className="text-gray-600 mb-6">
        {isSignedIn ? (
          <>
            Enter the verification code sent to the listing email to claim{" "}
            <span className="font-medium text-gray-900">{business.title}</span>.
          </>
        ) : (
          <>
            Create an account to claim{" "}
            <span className="font-medium text-gray-900">{business.title}</span>.
          </>
        )}
      </p>

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
          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm text-blue-600"
              disabled={busy}
              onClick={handleResend}
            >
              {isResending ? "Sending..." : "Resend code"}
            </Button>
          </div>
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="claim-email"
            className="text-sm font-medium text-foreground"
          >
            Listing email <span className="text-destructive">*</span>
          </label>
          <Input
            id="claim-email"
            type="email"
            value={business.email}
            readOnly
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            {isSignedIn
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
            className="px-8 bg-blue-600 text-white hover:bg-blue-700"
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
  return (
    <ToastProvider>
      <ClaimVerifyFormContent {...props} />
    </ToastProvider>
  );
}
