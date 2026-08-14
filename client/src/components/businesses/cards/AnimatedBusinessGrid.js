"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import DetailedBusinessCard from "./DetailedBusinessCard";
import {
  HOME_SECTION_IN_VIEW_MARGIN,
  staggerContainer,
  staggerItem,
} from "@/components/ui/homeSectionMotion";
const DEFAULT_GRID_CLASS =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

export default function AnimatedBusinessGrid({
  businesses = [],
  className = DEFAULT_GRID_CLASS,
  refreshKey = 0,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: HOME_SECTION_IN_VIEW_MARGIN });
  const reduceMotion = useReducedMotion();
  const useStagger = refreshKey === 0;

  if (!businesses.length) return null;

  if (!useStagger) {
    return (
      <motion.div
        key={refreshKey}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
      >
        {businesses.map((business) => (
          <div key={business.id} className="h-full">
            <DetailedBusinessCard business={business} />
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer(reduceMotion)}
    >
      {businesses.map((business) => (
        <motion.div
          key={business.id}
          className="h-full"
          variants={staggerItem(reduceMotion)}
        >
          <DetailedBusinessCard business={business} />
        </motion.div>
      ))}
    </motion.div>
  );
}
