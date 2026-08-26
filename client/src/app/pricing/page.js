import { Suspense } from "react";
import PricingPageContent from "@/components/pages/pricing/PricingPageContent";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";

const pageTitle = "Featured Listing Pricing | RadiatorRepairHub";
const pageDescription =
  "Upgrade a claimed radiator repair listing to Featured for $49/month. Get a Featured badge, search priority, and a place on the Featured page. Cancel anytime; current period fees are non-refundable.";

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  keywords:
    "featured listing pricing, radiator repair featured upgrade, claim listing upgrade, featured badge pricing",
  path: "/pricing",
});

const pricingOfferSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "RadiatorRepairHub Featured Listing",
  description:
    "Optional paid Featured upgrade for claimed radiator repair listings: Featured badge, search priority, and inclusion on the Featured businesses page.",
  brand: {
    "@type": "Organization",
    name: "RadiatorRepairHub",
  },
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/pricing`,
    priceCurrency: "USD",
    price: "49.00",
    priceValidUntil: "2027-12-31",
    availability: "https://schema.org/InStock",
    category: "Subscription",
  },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingOfferSchema),
        }}
      />
      <Suspense fallback={null}>
        <PricingPageContent />
      </Suspense>
    </>
  );
}
