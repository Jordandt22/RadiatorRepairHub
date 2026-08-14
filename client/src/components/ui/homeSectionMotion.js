"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export const HOME_SECTION_IN_VIEW_MARGIN = "-40px 0px";

export function useHomeSectionInView() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: HOME_SECTION_IN_VIEW_MARGIN });
  const reduceMotion = useReducedMotion();

  return { ref, inView, reduceMotion };
}

export function fadeIn(reduceMotion, delay = 0) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        delay: reduceMotion ? 0 : delay,
        ease: "easeOut",
      },
    },
  };
}

export function staggerContainer(reduceMotion) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };
}

export function staggerItem(reduceMotion) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        ease: "easeOut",
      },
    },
  };
}
