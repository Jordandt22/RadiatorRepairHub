import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import PageHeader from "@/components/layout/Header/PageHeader";
import PartnerBenefitsSummary from "@/components/checkout/PartnerBenefitsSummary";
import { buildPageMetadata, NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  ...buildPageMetadata({
    title: "Partner checkout canceled | RadiatorRepairHub",
    description:
      "Partner listing checkout was canceled. No charge was made. Contact us for a new checkout link when you are ready.",
    path: "/checkout/partner/cancel",
  }),
  robots: NOINDEX_ROBOTS,
};

export default function PartnerCheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Checkout", url: "/checkout/partner/cancel" },
        ]}
        pageTitle="Checkout canceled"
        pageDescription="No charge was made. Ask us for a new Partner checkout link when you are ready."
      />
      <div className="mx-auto mt-8 max-w-xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-lg border border-border bg-card px-4 py-8 sm:px-6">
          <PartnerBenefitsSummary heading="What you'd get with Partner" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Partner checkout links are one-time and expire. If you left by
            mistake or the link timed out, contact us and we will send a fresh
            link for your listing. You can also review the{" "}
            <Link
              href="/partner-agreement"
              className="text-interactive underline-offset-2 hover:underline"
            >
              Partner Agreement
            </Link>{" "}
            anytime.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className={buttonVariants({ className: "rounded-full" })}
            >
              Contact us for a new link
            </Link>
            <Link
              href="/"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              Back to home
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
