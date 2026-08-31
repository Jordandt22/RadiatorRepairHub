"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar/Navbar";
import PricingPromoBanner from "@/components/layout/PricingPromoBanner";
import Footer from "@/components/layout/Footer/Footer";
import BackToTop from "@/components/layout/BackToTop/BackToTop";

const PROTECTED_PREFIXES = ["/dashboard", "/settings"];

function isProtectedPath(pathname) {
  if (!pathname) return false;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function SiteChrome({
  children,
  businessEmail = null,
  businessPhoneDigits = null,
  topStates = null,
}) {
  const pathname = usePathname();
  const hidePublicChrome = isProtectedPath(pathname);

  if (hidePublicChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      {children}
      <Footer
        businessEmail={businessEmail}
        businessPhoneDigits={businessPhoneDigits}
        topStates={topStates}
      />
      <PricingPromoBanner />
      <BackToTop />
    </>
  );
}
