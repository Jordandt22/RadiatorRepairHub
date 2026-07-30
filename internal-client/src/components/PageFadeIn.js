"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export const PAGE_FADE_TRANSITION = {
  duration: 0.35,
  ease: "easeOut",
};

/**
 * Fades page content in on mount / route change.
 * Pass `animationKey` to re-trigger within the same route (e.g. tab changes).
 */
export default function PageFadeIn({
  children,
  className,
  animationKey,
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={animationKey ?? pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={PAGE_FADE_TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  );
}
