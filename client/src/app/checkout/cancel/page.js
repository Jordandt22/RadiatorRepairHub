import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import PageHeader from "@/components/layout/Header/PageHeader";
import FeaturedBenefitsSummary from "@/components/checkout/FeaturedBenefitsSummary";
import { buildPageMetadata, NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  ...buildPageMetadata({
    title: "Checkout canceled | RadiatorRepairHub",
    description: "Featured listing checkout was canceled.",
    path: "/checkout/cancel",
  }),
  robots: NOINDEX_ROBOTS,
};

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Checkout", url: "/checkout/cancel" },
        ]}
        pageTitle="Checkout canceled"
        pageDescription="No charge was made. You can upgrade to Featured whenever you're ready."
      />
      <div className="mx-auto mt-8 max-w-xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-sm border border-primary/20 bg-primary/5 px-4 py-8 sm:px-6">
          <FeaturedBenefitsSummary heading="What you'd get with Featured" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your listing stays as it is. If you left checkout by mistake, you can
            start Featured again from Pricing or jump back to your claimed
            listings.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className={buttonVariants({ className: "rounded-full" })}
            >
              View Featured pricing
            </Link>
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
