"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <a
      className="fixed right-4 bottom-[4.25rem] z-40 inline-flex size-11 items-center justify-center rounded-btn bg-accent text-white no-underline shadow-sm transition-colors duration-200 hover:bg-accent-hover md:bottom-6"
      href="#top"
      aria-label="Back to top"
    >
      <ChevronUp size={22} strokeWidth={2} aria-hidden />
    </a>
  );
}
