"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, CircleHelp } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
import PricingHeader from "@/components/pages/pricing/PricingHeader";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import { createFeaturedCheckoutSession } from "@/lib/api/billing";
import { useToast } from "@/contexts/ToastProvider";
import { cn } from "@/lib/utils";

const CLAIMED_FEATURES = [
  "Verified owner badge on your listing",
  "Edit hours, services, and contact details",
  "Up to 3 shop photos",
  "Basic analytics (page views and impressions)",
  "Weekly activity reports",
  "Quick Contact from drivers",
  "Dashboard access for your listing",
];

const FEATURED_FEATURES = [
  "Everything in Claimed Listing",
  "Featured badge next to Verified",
  "Priority placement in search and local listings",
  "Listed on the Featured businesses page",
  "Up to 10 shop photos",
  "Full listing analytics (clicks, CTR, position, sources)",
  "Competitor insights for shops in your city",
  "Cancel anytime from billing settings",
];

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

function FeatureList({ features }) {
  return (
    <ul className="mt-6 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex gap-3 text-sm text-foreground">
          <Check
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="leading-relaxed">{feature}</span>
        </li>
      ))}
    </ul>
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

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Simple Pricing for Shop Owners
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Claim your listing for free. Upgrade to Featured when you want more
            visibility, photos, and analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <article className="rounded-lg border border-border bg-card p-6 md:p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Claimed Listing
            </p>
            <p className="mt-2 font-heading text-4xl font-bold text-foreground">
              Free
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              For owners who want to manage their listing and appear as
              verified.
            </p>

            <Link
              href="/how-to-claim"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-6 w-full rounded-full sm:w-auto"
              )}
            >
              <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
              How to claim
            </Link>

            <FeatureList features={CLAIMED_FEATURES} />
          </article>

          <article className="rounded-lg border border-primary bg-card p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Featured Listing
              </p>
              <span className="rounded-full bg-tint px-2.5 py-0.5 text-xs font-medium text-primary">
                Optional upgrade
              </span>
            </div>
            <p className="mt-2 font-heading text-4xl font-bold text-foreground">
              $49
              <span className="text-lg font-medium text-muted-foreground">
                /month
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              For claimed shops that want higher placement and fuller listing
              tools. Tax may be added at checkout.
            </p>

            <div className="mt-6 space-y-4">
              {authLoading || (isSignedIn && loadingBusinesses) ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : showAuthGate ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Sign in with a claimed listing to upgrade to Featured.
                  </p>
                  <Link
                    href="/signin?redirect=%2Fpricing"
                    className={cn(
                      buttonVariants(),
                      "w-full rounded-full sm:w-auto"
                    )}
                  >
                    Sign in to upgrade
                  </Link>
                </div>
              ) : showNoEligible ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {businesses.length > 0
                      ? "All of your listings are already Featured."
                      : "You don't have a claimed listing yet. Claim a business first, then come back to upgrade."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/how-to-claim"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "rounded-full"
                      )}
                    >
                      <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
                      How to claim
                    </Link>
                    {businesses.length > 0 ? (
                      <Link
                        href="/dashboard"
                        className={cn(buttonVariants(), "rounded-full")}
                      >
                        My businesses
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
                    className="w-full rounded-full sm:w-auto"
                    disabled={!canUpgrade}
                    onClick={handleUpgrade}
                  >
                    {isSubmitting ? "Redirecting…" : "Upgrade to Featured"}
                    {!isSubmitting ? (
                      <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                    ) : null}
                  </Button>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Billed monthly through Stripe. Cancel anytime to stop future
                    renewals. Featured fees are non-refundable for the current
                    billing period.
                  </p>
                </div>
              )}

              <div className="space-y-2 border-t border-border pt-4">
                <FeaturedCheckoutLegalNote />
                <p className="text-xs font-medium text-[#635BFF]">
                  Powered by Stripe
                </p>
              </div>
            </div>

            <FeatureList features={FEATURED_FEATURES} />
          </article>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Claiming is free. Featured is an optional paid upgrade for shops that
          want extra placement in the directory.
        </p>
      </div>
    </div>
  );
}
