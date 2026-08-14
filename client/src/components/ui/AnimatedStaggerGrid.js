"use client";

import { motion } from "framer-motion";

import { staggerContainer, staggerItem } from "./homeSectionMotion";

export default function AnimatedStaggerGrid({
  inView,
  reduceMotion,
  className,
  children,
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer(reduceMotion)}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedStaggerItem({ reduceMotion, className, children }) {
  return (
    <motion.div className={className} variants={staggerItem(reduceMotion)}>
      {children}
    </motion.div>
  );
}
