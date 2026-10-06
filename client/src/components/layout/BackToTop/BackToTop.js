"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { usePricingPromoBanner } from "@/hooks/usePricingPromoBanner";
import { shouldBlockJourneyAds } from "@/components/layout/JourneyAdBlock";

function backToTopPosition({ promoVisible, isBusinessPage, adsBlocked }) {
  if (adsBlocked) {
    if (promoVisible) return "bottom-20";
    if (isBusinessPage) return "bottom-20 md:bottom-6";
    return "bottom-6";
  }

  if (promoVisible) return "bottom-44";
  if (isBusinessPage) return "bottom-44 md:bottom-32";
  return "bottom-32";
}

const BackToTop = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { visible: promoVisible } = usePricingPromoBanner();
  const isBusinessPage = pathname?.startsWith("/business/");
  const adsBlocked = shouldBlockJourneyAds(pathname);

  // Show button when page is scrolled down 300px
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`fixed right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-md transition-colors duration-300 focus:outline-none cursor-pointer ${backToTopPosition(
            { promoVisible, isBusinessPage, adsBlocked }
          )}`}
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default BackToTop;
