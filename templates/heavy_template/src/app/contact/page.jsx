import { BreadcrumbJsonLd } from "@/components/layout/JsonLd";
import { ContactSection } from "@/components/pages/contact/ContactSection";
import { PageBanner } from "@/components/pages/shared/PageBanner";
import { PageCta } from "@/components/pages/shared/PageCta";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { routeMetadata, streetLine } from "@/lib/seo";

export function generateMetadata() {
  return routeMetadata(getConfig(), "contact", "/contact");
}

export default function ContactPage() {
  const config = getConfig();
  const note = config.hours.notes?.trim();
  const subtitle = note ? `${streetLine(config)}. ${note}` : streetLine(config);
  return (
    <>
      <BreadcrumbJsonLd name={CHROME.nav.contact} path="/contact" />
      <PageBanner title={CHROME.nav.contact} subtitle={subtitle} />
      <ContactSection />
      <PageCta line={CHROME.ctaContact} heading={CHROME.ctaHeadingContact} />
    </>
  );
}
