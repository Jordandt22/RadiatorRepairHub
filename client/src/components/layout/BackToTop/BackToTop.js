"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";

const BackToTop = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const isBusinessPage = pathname?.startsWith("/business/");

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
          className={`fixed right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-md transition-colors duration-300 focus:outline-none cursor-pointer ${isBusinessPage
            ? "bottom-20 md:bottom-6"
            : "bottom-6"
            }`}
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default BackToTop;
