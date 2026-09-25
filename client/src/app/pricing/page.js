import { Suspense } from "react";
import PricingPageContent from "@/components/pages/pricing/PricingPageContent";
import PricingHeader from "@/components/pages/pricing/PricingHeader";
import { getPricingSiteStats } from "@/lib/analytics/pricingSiteStats";
import {
  FEATURED_PRICE_CURRENCY,
  FEATURED_YEARLY_PRICE_WITH_INTERVAL,
  featuredPriceValidUntil,
  formatFeaturedOfferPrice,
} from "@/lib/featuredPricing";
import {
  buildPageMetadata,
  composeDescription,
  composeTitle,
  SITE_URL,
} from "@/lib/seo/metadata";

const pageTitle = composeTitle("Featured Listing Pricing");
const pageDescription = composeDescription(
  `Upgrade a claimed radiator repair listing to Featured for ${FEATURED_YEARLY_PRICE_WITH_INTERVAL}.`,
  "Get a Featured badge, search priority, up to 10 shop photos, and full listing analytics."
);

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
    "Optional paid Featured upgrade for claimed radiator repair listings: Featured badge, search priority, up to 10 shop photos, full listing analytics, and competitor insights.",
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
    name: "Featured Listing (yearly)",
    description:
      "Yearly Featured listing subscription for claimed radiator repair businesses: Featured badge, search and directory priority, up to 10 shop photos, full analytics, and competitor insights.",
    priceCurrency: FEATURED_PRICE_CURRENCY,
    price: formatFeaturedOfferPrice(),
    priceValidUntil: featuredPriceValidUntil(),
    availability: "https://schema.org/InStock",
    category: "Subscription",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: formatFeaturedOfferPrice(),
      priceCurrency: FEATURED_PRICE_CURRENCY,
      billingDuration: "P1Y",
      unitText: "year",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "ANN",
      },
    },
  },
};

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PricingHeader />
    </div>
  );
}

export default async function PricingPage() {
  const siteStats = await getPricingSiteStats();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(featuredListingServiceSchema),
        }}
      />
      <Suspense fallback={<PricingPageFallback />}>
        <PricingPageContent siteStats={siteStats} />
      </Suspense>
    </>
  );
}
