"use client";

import { Children } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUpItem, staggerContainer, viewportOnce } from "@/lib/motion";

/**
 * Stagger fade-up for direct children (e.g. service cards, gallery figures).
 * Pass className for the grid/container; each child is wrapped in motion.div.
 */
export function StaggerChildren({ children, className, stagger = 0.1 }) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {items.map((child, i) => (
        <motion.div key={child.key ?? i} variants={fadeUpItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
