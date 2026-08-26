"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useInView, useReducedMotion } from "framer-motion";

import DetailedBusinessCard from "./DetailedBusinessCard";
import FeaturedUpgradeCard from "@/components/pages/featured/FeaturedUpgradeCard";
import { HOME_SECTION_IN_VIEW_MARGIN } from "@/components/ui/homeSectionMotion";

const DEFAULT_GRID_CLASS =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

export default function AnimatedBusinessGrid({
  businesses = [],
  placeholderCount = 0,
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
  const priorityCount = trigger === "mount" ? 2 : 0;
  const placeholders = Math.max(0, placeholderCount);

  if (!businesses.length && placeholders === 0) return null;

  const featuredBusinesses = businesses.map((business) => ({
    ...business,
    is_featured: true,
  }));

  const items = [
    ...featuredBusinesses.map((business, index) => ({
      key: business.id,
      node: (
        <DetailedBusinessCard
          business={business}
          priority={index < priorityCount}
        />
      ),
    })),
    ...Array.from({ length: placeholders }, (_, index) => ({
      key: `featured-upgrade-slot-${index}`,
      node: <FeaturedUpgradeCard />,
    })),
  ];

  if (!useStagger) {
    return (
      <div
        key={`${pathname}-quick-${refreshKey}`}
        className={`${className} stagger-fade-in-quick`}
      >
        {items.map((item) => (
          <div key={item.key} className="h-full">
            {item.node}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} key={`${pathname}-stagger`} className={className}>
      {items.map((item, index) => (
        <div
          key={item.key}
          className={`h-full ${shouldAnimate ? "stagger-fade-in" : "opacity-0"}`}
          style={
            shouldAnimate ? { animationDelay: `${index * 80}ms` } : undefined
          }
        >
          {item.node}
        </div>
      ))}
    </div>
  );
}
