"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import PageHeader from "@/components/layout/Header/PageHeader";
import FeaturedBenefitsSummary from "@/components/checkout/FeaturedBenefitsSummary";
import { createBillingPortalSession } from "@/lib/api/billing";
import { useToast } from "@/contexts/ToastProvider";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";

export default function CheckoutSuccessPage() {
  const { isSignedIn, isLoading } = useIsSignedIn();
  const { showCustomError } = useToast();
  const [isOpening, setIsOpening] = useState(false);

  const handleManage = async () => {
    if (isOpening) return;
    setIsOpening(true);
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Checkout", url: "/checkout/success" },
        ]}
        pageTitle="You're all set"
        pageDescription="Thanks for upgrading. Featured placement is applied after Stripe confirms payment, usually within a few seconds."
      />
      <div className="mx-auto mt-8 max-w-xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-sm border border-primary/20 bg-primary/5 px-4 py-8 sm:px-6">
          <FeaturedBenefitsSummary heading="Your Featured benefits" />
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
                href="/signin?redirect=%2Fsettings%3Ftab%3Dpayments"
                className={buttonVariants({ className: "rounded-full" })}
              >
                Sign in to manage
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
