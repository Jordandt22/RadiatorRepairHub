"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CircleHelp, Search } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
import PricingHeader from "@/components/pages/pricing/PricingHeader";
import PricingStatsStrip from "@/components/pages/pricing/PricingStatsStrip";
import PricingRoiCalculator from "@/components/pages/pricing/PricingRoiCalculator";
import PricingFaqSection from "@/components/pages/pricing/PricingFaqSection";
import FeaturedUpgradeDialog from "@/components/pages/pricing/FeaturedUpgradeDialog";
import FeaturedUpgradeCtaLabel from "@/components/pages/pricing/FeaturedUpgradeCtaLabel";
import { featuredUpgradeButtonClass } from "@/components/pages/pricing/featuredUpgradeStyles";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import { createFeaturedCheckoutSession } from "@/lib/api/billing";
import { formatNumber } from "@/lib/businessStats/formatStats";
import {
  FEATURED_PLAN_FEATURES,
  FEATURED_PRICE_BLURB,
  FEATURED_YEARLY_PRICE,
} from "@/lib/featuredPricing";
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

function FeatureList({ features }) {
  return (
    <ul className="mt-6 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex gap-3 text-sm text-foreground">
          <Check
            className="mt-0.5 size-4 shrink-0 text-lime-700"
            aria-hidden="true"
          />
          <span className="leading-relaxed font-medium text-primary">
            {feature}
          </span>
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

export default function PricingPageContent({ siteStats = null }) {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("business") || "";
  const posthog = usePostHog();
  const { isSignedIn, isLoading: authLoading } = useIsSignedIn();
  const { showCustomError } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedId, setSelectedId] = useState(preselectedId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("select");

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

  const captureCheckout = (event, businessId, props = {}) => {
    const business =
      eligible.find((b) => b.id === businessId) ||
      selectedBusiness ||
      null;
    posthog?.capture(event, {
      business_id: business?.id || businessId || undefined,
      business_slug: business?.slug || undefined,
      business_name: business?.title || undefined,
      signed_in: Boolean(isSignedIn),
      source: "pricing",
      ...props,
    });
  };

  const startCheckout = async (businessId, source = "pricing") => {
    if (!businessId || isSubmitting) return;
    setIsSubmitting(true);
    captureCheckout("featured_checkout_started", businessId, {
      cta_source: source,
    });
    try {
      const { data, error } = await createFeaturedCheckoutSession(businessId);
      if (error || !data?.url) {
        captureCheckout("featured_checkout_failed", businessId, {
          cta_source: source,
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
      captureCheckout("featured_checkout_failed", businessId, {
        cta_source: source,
      });
      showCustomError("Unable to start checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeClick = (source = "pricing") => {
    if (authLoading || (isSignedIn && loadingBusinesses) || isSubmitting) {
      return;
    }

    if (!isSignedIn) {
      const returnPath = preselectedId
        ? `/pricing?business=${encodeURIComponent(preselectedId)}`
        : "/pricing";
      posthog?.capture("featured_cta_clicked", {
        source,
        signed_in: false,
        business_id: preselectedId || undefined,
      });
      window.location.assign(
        `/signin?redirect=${encodeURIComponent(returnPath)}`
      );
      return;
    }

    if (eligible.length === 0) {
      setDialogMode("empty");
      setDialogOpen(true);
      return;
    }

    if (eligible.length === 1) {
      const onlyId = eligible[0].id;
      setSelectedId(onlyId);
      void startCheckout(onlyId, source);
      return;
    }

    setDialogMode("select");
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    if (!selectedId) return;
    void startCheckout(selectedId, "pricing_dialog");
  };

  const upgradeLoading = authLoading || (isSignedIn && loadingBusinesses);
  const upgradeBusy = upgradeLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-background">
      <PricingHeader />

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        {siteStats ? (
          <PricingStatsStrip
            visitorsLast30Days={siteStats.visitorsLast30Days}
            phoneClicksLast30Days={siteStats.phoneClicksLast30Days}
            pageViewsLast30Days={siteStats.pageViewsLast30Days}
            listedBusinesses={siteStats.listedBusinesses}
          />
        ) : null}

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Be the First Shop Customers See
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Claim your listing for free. Upgrade to Featured when you want more
            visibility, photos, and analytics.
          </p>
          {siteStats?.searchesLast30Days != null &&
            Number.isFinite(Number(siteStats.searchesLast30Days)) &&
            Number(siteStats.searchesLast30Days) > 0 ? (
            <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground bg-tint px-4 py-2 border border-primary rounded-full">
              <Search
                className="size-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="text-primary font-medium">
                <span className="font-bold">{formatNumber(siteStats.searchesLast30Days)}</span> Searches (Last 30 Days)
              </span>
            </p>
          ) : null}
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

          <article className="rounded-lg border-2 border-primary/50 bg-card p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:scale-101 hover:shadow-lg hover:border-primary motion-reduce:transform-none motion-reduce:transition-colors">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Featured Listing
              </p>
              <span className="rounded-full bg-tint px-2.5 py-0.5 text-xs font-medium text-primary">
                Optional upgrade
              </span>
            </div>
            <p className="mt-2 font-heading text-4xl font-bold text-foreground">
              ${FEATURED_YEARLY_PRICE}
              <span className="text-lg font-medium text-muted-foreground">
                /year
              </span>
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {FEATURED_PRICE_BLURB}
            </p>

            <div className="mt-6 space-y-4">
              <Button
                type="button"
                className={cn("w-full sm:w-auto", featuredUpgradeButtonClass)}
                disabled={upgradeBusy}
                aria-busy={upgradeBusy}
                onClick={() => handleUpgradeClick("pricing_card")}
              >
                <FeaturedUpgradeCtaLabel
                  isSubmitting={isSubmitting}
                  isLoading={upgradeLoading}
                />
              </Button>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Cancel anytime · Tax may be added at checkout · Powered by
                Stripe
              </p>
            </div>

            <FeatureList features={FEATURED_PLAN_FEATURES} />
          </article>
        </div>
      </div>

      <PricingRoiCalculator
        onUpgradeClick={() => handleUpgradeClick("pricing_roi")}
        upgradeBusy={upgradeBusy}
        upgradeLoading={upgradeLoading}
        isSubmitting={isSubmitting}
      />

      <PricingFaqSection
        onUpgradeClick={() => handleUpgradeClick("pricing_faq")}
        upgradeBusy={upgradeBusy}
        upgradeLoading={upgradeLoading}
        isSubmitting={isSubmitting}
      />

      <FeaturedUpgradeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        eligible={eligible}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        onConfirm={handleDialogConfirm}
        isSubmitting={isSubmitting}
        hasAnyBusinesses={businesses.length > 0}
      />
    </div>
  );
}
