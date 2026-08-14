"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useInView, useReducedMotion } from "framer-motion";

import DetailedBusinessCard from "./DetailedBusinessCard";
import { HOME_SECTION_IN_VIEW_MARGIN } from "@/components/ui/homeSectionMotion";

const DEFAULT_GRID_CLASS =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

export default function AnimatedBusinessGrid({
  businesses = [],
  className = DEFAULT_GRID_CLASS,
  refreshKey = 0,
  /** "mount" = animate immediately; "inView" = wait until scrolled into view */
  trigger = "inView",
}) {
  const pathname = usePathname();
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: HOME_SECTION_IN_VIEW_MARGIN,
  });
  const reduceMotion = useReducedMotion();
  const useStagger = refreshKey === 0;
  const shouldAnimate =
    useStagger && (trigger === "mount" || inView || reduceMotion);
  // Eager-load first row when this grid is the page's primary content (not below-fold home).
  const priorityCount = trigger === "mount" ? 2 : 0;

  if (!businesses.length) return null;

  if (!useStagger) {
    return (
      <div
        key={`${pathname}-quick-${refreshKey}`}
        className={`${className} stagger-fade-in-quick`}
      >
        {businesses.map((business, index) => (
          <div key={business.id} className="h-full">
            <DetailedBusinessCard
              business={business}
              priority={index < priorityCount}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} key={`${pathname}-stagger`} className={className}>
      {businesses.map((business, index) => (
        <div
          key={business.id}
          className={`h-full ${shouldAnimate ? "stagger-fade-in" : "opacity-0"}`}
          style={
            shouldAnimate
              ? { animationDelay: `${index * 80}ms` }
              : undefined
          }
        >
          <DetailedBusinessCard
            business={business}
            priority={index < priorityCount}
          />
        </div>
      ))}
    </div>
  );
}
