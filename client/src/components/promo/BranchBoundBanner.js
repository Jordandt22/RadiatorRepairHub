"use client";

import { useEffect, useState } from "react";
import { Yellowtail } from "next/font/google";

const yellowtail = Yellowtail({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/** ISO timestamp of when the user dismissed; banner hides until 3 days after this */
const STORAGE_KEY = "branchbound-banner-dismissed-at";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function isWithinDismissWindow(storedIso) {
  if (!storedIso || typeof storedIso !== "string") return false;
  const dismissedAt = new Date(storedIso).getTime();
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < THREE_DAYS_MS;
}

const bgStyle = {
  backgroundImage: "url(/assets/images/branchbound-bg.webp)",
};

export default function BranchBoundBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isWithinDismissWindow(stored)) {
        setDismissed(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (!mounted || dismissed) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden py-12 sm:pt-20 sm:pb-8 px-4 sm:px-6 lg:px-8 border-y-3 border-gray-900"
      aria-label="BranchBound promotion"
    >
      {/* Background: two panels side by side, scroll left infinitely (seamless loop) */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="flex h-full w-[200%] animate-branchbound-bg-scroll">
          <div
            className="h-full w-1/2 shrink-0 bg-cover bg-center bg-no-repeat"
            style={bgStyle}
          />
          <div
            className="h-full w-1/2 shrink-0 bg-cover bg-center bg-no-repeat"
            style={bgStyle}
          />
        </div>
      </div>
      {/* Overlay for readability */}
      <div
        className="absolute inset-0 bg-black/65 sm:bg-black/50"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl text-white font-normal leading-relaxed drop-shadow-md px-2 font-heading`}
        >
          Embark on an Interactive Adventure, Where Your Choices Shape the Story
        </h2>

        <a
          href="https://branchbound.app"
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-8 inline-flex items-center justify-center rounded-full bg-[#189c6a] px-10 py-2 text-base sm:text-lg font-normal text-white shadow-lg transition-all hover:bg-[#11724d] focus:outline-none hover:scale-95 font-heading tracking-wide`}
        >
          Start Your Adventure
        </a>

        <p
          className={`mt-6 text-xl sm:text-3xl text-white drop-shadow font-normal ${yellowtail.className} text-2xl tracking-wide`}
        >
          BranchBound
        </p>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-8 text-sm sm:text-base rounded-full py-2 px-6 text-white hover:text-white bg-white/20 focus:outline-none hover:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Dismiss banner"
        >
          Don&apos;t show again for 3 days
        </button>
      </div>
    </section >
  );
}
