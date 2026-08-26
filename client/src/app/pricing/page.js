import { Suspense } from "react";
import PricingPageContent from "@/components/pages/pricing/PricingPageContent";
import { buildPageMetadata } from "@/lib/seo/metadata";

const pageTitle = "Featured Listing Pricing | RadiatorRepairHub";
const pageDescription =
  "Upgrade a claimed radiator repair listing to Featured for $49/month. Get a Featured badge, search priority, and a place on the Featured page.";

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageContent />
    </Suspense>
  );
}
