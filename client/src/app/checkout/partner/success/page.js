import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import PageHeader from "@/components/layout/Header/PageHeader";
import { buildPageMetadata, NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const metadata = {
  ...buildPageMetadata({
    title: "Partner checkout complete | RadiatorRepairHub",
    description:
      "Your Partner listing payment was received. Check your email to set a password and sign in.",
    path: "/checkout/partner/success",
  }),
  robots: NOINDEX_ROBOTS,
};

export default function PartnerCheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Checkout", url: "/checkout/partner/success" },
        ]}
        pageTitle="Payment received"
        pageDescription="Check your email to set a password and sign in. Your Partner listing is applied after Stripe confirms the payment."
      />
      <div className="mx-auto mt-8 max-w-xl space-y-4 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-lg border border-border bg-card px-4 py-8 sm:px-6">
          <p className="text-sm leading-relaxed text-foreground">
            If you already have a RadiatorRepairHub account for that email,
            sign in with it. The listing is added to that account.
          </p>
          <Link
            href="/signin"
            className={cn(buttonVariants(), "w-full sm:w-auto")}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
