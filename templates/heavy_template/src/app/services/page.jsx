import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/layout/JsonLd";
import { PageBanner } from "@/components/pages/shared/PageBanner";
import { PageCta } from "@/components/pages/shared/PageCta";
import { ServiceGrid } from "@/components/pages/services/ServiceGrid";
import { ServicesIntro } from "@/components/pages/services/ServicesIntro";
import { ServicesFaq } from "@/components/pages/services/ServicesFaq";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { routeMetadata } from "@/lib/seo";

export function generateMetadata() {
  return routeMetadata(getConfig(), "services", "/services");
}

export default function ServicesPage() {
  const { faq, shop, hero } = getConfig();
  const subtitle = `${shop.tagline}. ${hero.subheadline}`;
  return (
    <>
      <BreadcrumbJsonLd name={CHROME.nav.services} path="/services" />
      <FaqJsonLd items={faq} />
      <PageBanner title={CHROME.nav.services} subtitle={subtitle} />
      <ServicesIntro />
      <ServiceGrid all className="pt-8!" />
      <ServicesFaq />
      <PageCta line={CHROME.ctaServices} heading={CHROME.ctaHeadingServices} />
    </>
  );
}
