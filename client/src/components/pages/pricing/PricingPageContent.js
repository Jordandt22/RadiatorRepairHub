"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
import PricingHeader from "@/components/pages/pricing/PricingHeader";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import { createFeaturedCheckoutSession } from "@/lib/api/billing";
import { useToast } from "@/contexts/ToastProvider";
import { FEATURED_BENEFITS } from "@/lib/featuredBenefits";

function FeaturedCheckoutLegalNote() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      By starting Featured checkout, you agree to our{" "}
      <Link
        href="/terms"
        className="font-medium text-interactive underline hover:text-primary"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        className="font-medium text-interactive underline hover:text-primary"
      >
        Privacy Policy
      </Link>
      . Payment is processed by Stripe.
    </p>
  );
}

function eligibleBusinesses(list) {
  return (Array.isArray(list) ? list : []).filter(
    (business) => business?.id && !business.is_featured
  );
}

export default function PricingPageContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("business") || "";
  const posthog = usePostHog();
  const { isSignedIn, isLoading: authLoading } = useIsSignedIn();
  const { showCustomError } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedId, setSelectedId] = useState(preselectedId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setBusinesses([]);
      return;
    }

    let mounted = true;
    setLoadingBusinesses(true);
    fetchOwnedBusinesses().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setBusinesses([]);
      } else {
        setBusinesses(Array.isArray(data) ? data : []);
      }
      setLoadingBusinesses(false);
    });

    return () => {
      mounted = false;
    };
  }, [isSignedIn]);

  const eligible = useMemo(() => eligibleBusinesses(businesses), [businesses]);

  useEffect(() => {
    if (!eligible.length) {
      setSelectedId("");
      return;
    }
    if (preselectedId && eligible.some((b) => b.id === preselectedId)) {
      setSelectedId(preselectedId);
      return;
    }
    setSelectedId((current) =>
      eligible.some((b) => b.id === current) ? current : eligible[0].id
    );
  }, [eligible, preselectedId]);

  const selectedBusiness = useMemo(
    () => eligible.find((business) => business.id === selectedId) ?? null,
    [eligible, selectedId]
  );

  const captureCheckout = (event, props = {}) => {
    posthog?.capture(event, {
      business_id: selectedBusiness?.id || selectedId || undefined,
      business_slug: selectedBusiness?.slug || undefined,
      business_name: selectedBusiness?.title || undefined,
      signed_in: Boolean(isSignedIn),
      source: "pricing",
      ...props,
    });
  };

  const handleUpgrade = async () => {
    if (!selectedId || isSubmitting) return;
    setIsSubmitting(true);
    captureCheckout("featured_checkout_started");
    try {
      const { data, error } = await createFeaturedCheckoutSession(selectedId);
      if (error || !data?.url) {
        captureCheckout("featured_checkout_failed", {
          error_code:
            typeof error?.code === "string" ? error.code : undefined,
          error_message:
            typeof error?.message === "string" ? error.message : undefined,
        });
        showCustomError(
          typeof error?.message === "string"
            ? error.message
            : "Unable to start checkout. Please try again."
        );
        return;
      }
      window.location.assign(data.url);
    } catch {
      captureCheckout("featured_checkout_failed");
      showCustomError("Unable to start checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAuthGate = !authLoading && !isSignedIn;
  const showNoEligible =
    isSignedIn && !loadingBusinesses && eligible.length === 0;
  const canUpgrade =
    isSignedIn && !loadingBusinesses && Boolean(selectedId) && !isSubmitting;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PricingHeader />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <section>
          <div className="mb-8 text-center">
            <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
              What Featured includes
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              One monthly plan for a claimed listing you own.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURED_BENEFITS.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-lg border border-border p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-tint">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 md:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Featured listing
          </p>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">
            $49
            <span className="text-lg font-medium text-muted-foreground">
              /month
            </span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground bg-primary/5 p-4 rounded-sm border border-primary/20">
            <li className="border-l-2 border-primary pl-2">Tax is not included and may be added at checkout.</li>
            <li className="border-l-2 border-primary pl-2">Cancel anytime from your billing portal.</li>
            <li className="border-l-2 border-primary pl-2">
              Your listing must be claimed before you can upgrade.{" "}
              <Link
                href="/how-to-claim"
                className="font-medium text-interactive underline hover:text-primary"
              >
                How to claim
              </Link>
            </li>
          </ul>

          {authLoading || (isSignedIn && loadingBusinesses) ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
          ) : showAuthGate ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in with a claimed listing to upgrade to Featured.
              </p>
              <Link
                href="/signin?redirect=%2Fpricing"
                className={buttonVariants({ className: "rounded-full" })}
              >
                Sign in to upgrade
              </Link>
            </div>
          ) : showNoEligible ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                {businesses.length > 0
                  ? "All of your listings are already Featured."
                  : "You don't have a claimed listing yet. Claim a business first, then come back to upgrade."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/how-to-claim"
                  className={buttonVariants({
                    variant: "outline",
                    className: "rounded-full",
                  })}
                >
                  How to claim
                </Link>
                {businesses.length > 0 ? (
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ className: "rounded-full" })}
                  >
                    My businesses
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="featured-business"
                  className="text-sm font-medium text-foreground"
                >
                  Choose one of your claimed businesses
                </label>
                <select
                  id="featured-business"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {eligible.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                className="rounded-full"
                disabled={!canUpgrade}
                onClick={handleUpgrade}
              >
                {isSubmitting ? "Redirecting…" : "Upgrade to Featured"}
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Billed monthly through Stripe. Cancel anytime to stop future
                renewals. Featured fees are non-refundable for the current
                billing period.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <FeaturedCheckoutLegalNote />
            <p className="text-xs font-medium text-[#635BFF]">Powered by Stripe</p>
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Claiming your listing is free. A featured listing is an optional paid upgrade
            for shops that want extra placement in the directory.
          </p>
        </section>
      </div>
    </div>
  );
}
