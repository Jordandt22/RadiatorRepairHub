"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useInView, useReducedMotion } from "framer-motion";

export const HOME_SECTION_IN_VIEW_MARGIN = "-40px 0px";

export function useHomeSectionInView() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: HOME_SECTION_IN_VIEW_MARGIN });
  const reduceMotion = useReducedMotion();

  return { ref, inView, reduceMotion };
}

/**
 * Ensures a real hidden → visible paint cycle on client navigations.
 * Soft nav can skip Framer's mount `initial` unless we force a frame at hidden.
 */
export function useEnterAnimation(extraKey = "") {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, extraKey]);

  return visible;
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
