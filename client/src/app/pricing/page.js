import { Suspense } from "react";
import PricingPageContent from "@/components/pages/pricing/PricingPageContent";
import PricingHeader from "@/components/pages/pricing/PricingHeader";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";

const pageTitle = "Featured Listing Pricing | RadiatorRepairHub";
const pageDescription =
  "Upgrade a claimed radiator repair listing to Featured for $49/month. Get a Featured badge, search priority, up to 10 shop photos, and a place on the Featured page. Cancel anytime; current period fees are non-refundable.";

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  keywords:
    "featured listing pricing, radiator repair featured upgrade, claim listing upgrade, featured badge pricing",
  path: "/pricing",
});

const featuredListingServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "RadiatorRepairHub Featured Listing",
  description:
    "Optional paid Featured upgrade for claimed radiator repair listings: Featured badge, search priority, up to 10 shop photos, and inclusion on the Featured businesses page.",
  url: `${SITE_URL}/pricing`,
  image: `${SITE_URL}/assets/logos/logo.png`,
  serviceType: "Featured Business Listing",
  provider: {
    "@id": `${SITE_URL}/#organization`,
  },
  brand: {
    "@type": "Brand",
    name: "RadiatorRepairHub",
  },
  areaServed: {
    "@type": "Country",
    name: "United States",
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

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PricingHeader />
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(featuredListingServiceSchema),
        }}
      />
      <Suspense fallback={<PricingPageFallback />}>
        <PricingPageContent />
      </Suspense>
    </>
  );
}
