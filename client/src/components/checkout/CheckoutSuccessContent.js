"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
import PageHeader from "@/components/layout/Header/PageHeader";
import FeaturedBenefitsSummary from "@/components/checkout/FeaturedBenefitsSummary";
import {
  createBillingPortalSession,
  fetchCheckoutSessionStatus,
} from "@/lib/api/billing";
import { useToast } from "@/contexts/ToastProvider";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 12;

function buildPageCopy({ verifying, paid, featuredApplied, verifyError }) {
  if (verifying) {
    return {
      title: "Confirming your upgrade",
      description:
        "Thanks for upgrading. We’re confirming payment with Stripe and applying Featured placement—this usually takes a few seconds.",
    };
  }
  if (verifyError) {
    return {
      title: "Thanks for upgrading",
      description:
        "If payment succeeded, Featured placement is applied after Stripe confirms it. You can check status anytime under Settings → Payments.",
    };
  }
  if (paid && featuredApplied) {
    return {
      title: "You're all set",
      description:
        "Payment confirmed. Featured placement is active on your listing.",
    };
  }
  if (paid) {
    return {
      title: "Payment received",
      description:
        "Stripe confirmed payment. Featured placement should appear on your listing shortly if it is not visible yet.",
    };
  }
  return {
    title: "Checkout received",
    description:
      "We’re still waiting on Stripe to confirm payment. Featured placement applies after confirmation.",
  };
}

export default function CheckoutSuccessContent() {
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const { isSignedIn, isLoading } = useIsSignedIn();
  const { showCustomError } = useToast();
  const [isOpening, setIsOpening] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(sessionId));
  const [status, setStatus] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const completedFired = useRef(false);

  useEffect(() => {
    if (!sessionId || isLoading) return;
    if (!isSignedIn) {
      setVerifying(false);
      setVerifyError("Sign in to confirm Featured checkout status.");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timerId = null;

    const finish = (nextStatus, errorMessage = "") => {
      if (cancelled) return;
      setStatus(nextStatus);
      setVerifyError(errorMessage);
      setVerifying(false);
    };

    const poll = async () => {
      attempts += 1;
      try {
        const { data, error } = await fetchCheckoutSessionStatus(sessionId);
        if (cancelled) return;

        if (error || !data) {
          if (attempts >= MAX_POLL_ATTEMPTS) {
            finish(
              null,
              typeof error?.message === "string"
                ? error.message
                : "Unable to confirm checkout status."
            );
          } else {
            timerId = setTimeout(poll, POLL_INTERVAL_MS);
          }
          return;
        }

        const paid = Boolean(data.paid);
        const featuredApplied = Boolean(data.featuredApplied);

        if ((paid && featuredApplied) || attempts >= MAX_POLL_ATTEMPTS) {
          finish(data);
          return;
        }

        setStatus(data);
        timerId = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          finish(null, "Unable to confirm checkout status.");
        } else {
          timerId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };

    setVerifying(true);
    poll();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [sessionId, isSignedIn, isLoading]);

  useEffect(() => {
    if (completedFired.current || verifying || !status?.paid) return;
    completedFired.current = true;
    posthog?.capture("featured_checkout_completed", {
      source: "checkout_success",
      business_id: status.businessId || undefined,
      business_slug: status.businessSlug || undefined,
      business_name: status.businessTitle || undefined,
      featured_applied: Boolean(status.featuredApplied),
      is_featured: Boolean(status.isFeatured),
      subscription_status: status.subscriptionStatus || undefined,
      payment_status: status.paymentStatus || undefined,
      session_status: status.sessionStatus || undefined,
    });
  }, [verifying, status, posthog]);

  const handleManage = async () => {
    if (isOpening) return;
    setIsOpening(true);
    posthog?.capture("featured_portal_opened", {
      source: "checkout_success",
      signed_in: Boolean(isSignedIn),
    });
    try {
      const { data, error } = await createBillingPortalSession();
      if (error || !data?.url) {
        showCustomError(
          typeof error?.message === "string"
            ? error.message
            : "Unable to open billing portal."
        );
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      showCustomError("Unable to open billing portal.");
    } finally {
      setIsOpening(false);
    }
  };

  const copy = buildPageCopy({
    verifying: verifying || (Boolean(sessionId) && isLoading),
    paid: Boolean(status?.paid),
    featuredApplied: Boolean(status?.featuredApplied),
    verifyError,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Checkout", url: "/checkout/success" },
        ]}
        pageTitle={copy.title}
        pageDescription={copy.description}
      />
      <div className="mx-auto mt-8 max-w-xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-sm border border-primary/20 bg-primary/5 px-4 py-8 sm:px-6">
          <FeaturedBenefitsSummary heading="Your Featured benefits" />
          {verifying || (Boolean(sessionId) && isLoading) ? (
            <p className="text-sm text-muted-foreground">Confirming with Stripe…</p>
          ) : null}
          {verifyError && !verifying ? (
            <p className="text-sm text-muted-foreground">{verifyError}</p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">
            You can manage billing anytime from Settings, or jump back to your
            claimed listings.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {isLoading ? (
              <Button className="rounded-full" disabled>
                Loading…
              </Button>
            ) : isSignedIn ? (
              <Button
                type="button"
                className="rounded-full"
                onClick={handleManage}
                disabled={isOpening}
              >
                {isOpening ? "Opening…" : "Manage Subscription"}
              </Button>
            ) : (
              <Link
                href={`/signin?redirect=${encodeURIComponent(
                  sessionId
                    ? `/checkout/success?session_id=${sessionId}`
                    : "/settings?tab=payments"
                )}`}
                className={buttonVariants({ className: "rounded-full" })}
              >
                Sign in to confirm
              </Link>
            )}
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              My Businesses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
