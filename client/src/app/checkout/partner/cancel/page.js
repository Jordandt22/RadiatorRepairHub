import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import PageHeader from "@/components/layout/Header/PageHeader";
import { buildPageMetadata, NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  ...buildPageMetadata({
    title: "Partner checkout canceled | RadiatorRepairHub",
    description: "Partner listing checkout was canceled. No charge was made.",
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
        pageDescription="No charge was made. Ask us for a new checkout link when you are ready."
      />
      <div className="mx-auto mt-8 max-w-xl px-4 sm:px-6 lg:px-8">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
