import { AboutSection } from "@/components/pages/about/AboutSection";
import { GalleryGrid } from "@/components/pages/shared/GalleryGrid";
import { PageCta } from "@/components/pages/shared/PageCta";
import { PageBanner } from "@/components/pages/shared/PageBanner";
import { TrustStrip } from "@/components/pages/home/TrustStrip";
import { BreadcrumbJsonLd } from "@/components/layout/JsonLd";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { routeMetadata } from "@/lib/seo";

export function generateMetadata() {
  return routeMetadata(getConfig(), "about", "/about");
}

export default function AboutPage() {
  const { about, shop } = getConfig();
  const years = about.yearsInBusiness
    ? `${about.yearsInBusiness} years in ${shop.city}`
    : null;
  const subtitle = [years, about.warranty].filter(Boolean).join(". ") + ".";
  return (
    <>
      <BreadcrumbJsonLd name={CHROME.nav.about} path="/about" />
      <PageBanner title={CHROME.nav.about} subtitle={subtitle} />
      <TrustStrip />
      <AboutSection />
      <GalleryGrid />
      <PageCta line={CHROME.ctaAbout} />
    </>
  );
}
