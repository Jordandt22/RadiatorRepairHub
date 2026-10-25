"use client";

import { motion, useReducedMotion } from "motion/react";
import { easeOut } from "@/lib/motion";

export function HeroPhoto({ className, children }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 72 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, ease: easeOut, delay: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
