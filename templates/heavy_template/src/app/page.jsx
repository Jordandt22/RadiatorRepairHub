import { Hero } from "@/components/pages/home/Hero";
import { Marquee } from "@/components/pages/home/Marquee";
import { TrustStrip } from "@/components/pages/home/TrustStrip";
import { ReviewsSection } from "@/components/pages/home/ReviewsSection";
import { ServiceGrid } from "@/components/pages/services/ServiceGrid";
import { AboutSection } from "@/components/pages/about/AboutSection";
import { GalleryGrid } from "@/components/pages/shared/GalleryGrid";
import { ContactSection } from "@/components/pages/contact/ContactSection";
import { PageCta } from "@/components/pages/shared/PageCta";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { routeMetadata } from "@/lib/seo";

export function generateMetadata() {
  return routeMetadata(getConfig(), "home", "/");
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <TrustStrip />
      <ServiceGrid />
      <AboutSection teaser />
      <ReviewsSection />
      <GalleryGrid />
      <ContactSection variant="home" />
      <PageCta line={CHROME.ctaHome} imageSizes="(min-width: 1024px) 40rem, 100vw" />
    </>
  );
}
