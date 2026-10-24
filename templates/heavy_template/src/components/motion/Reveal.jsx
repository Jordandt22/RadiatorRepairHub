"use client";

import { motion, useReducedMotion } from "motion/react";
import { easeOut, slideFromRight, viewportOnce } from "@/lib/motion";

const variants = {
  "fade-up": {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  },
  "from-right": slideFromRight,
};

export function Reveal({ children, className, variant = "fade-up" }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants[variant] ?? variants["fade-up"]}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}
