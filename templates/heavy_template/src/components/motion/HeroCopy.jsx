"use client";

import { motion, useReducedMotion } from "motion/react";
import { heroFadeUpItem, staggerContainer } from "@/lib/motion";
import { btnPrimary, btnRow, btnSecondary, h1, muted } from "@/lib/ui";
import { GetAQuoteLink } from "@/components/pages/shared/GetAQuoteLink";

const eyebrowClass =
  "mb-2 text-sm font-semibold tracking-[0.12em] text-accent uppercase";

export function HeroCopy({ eyebrow, headline, subheadline, callHref, callText, showSecondaryCta }) {
  const reduce = useReducedMotion();

  const content = [
    <p className={eyebrowClass} key="eyebrow">
      {eyebrow}
    </p>,
    <h1 className={h1} key="headline">
      {headline}
    </h1>,
    <p className={`${muted} max-w-prose`} key="sub">
      {subheadline}
    </p>,
    <div className={`${btnRow} mt-6`} key="cta">
      <a className={btnPrimary} href={callHref}>
        {callText}
      </a>
      {showSecondaryCta ? <GetAQuoteLink className={btnSecondary} /> : null}
    </div>,
  ];

  if (reduce) {
    return <div>{content}</div>;
  }

  return (
    <motion.div
      variants={staggerContainer(0.11, 0.15)}
      initial="hidden"
      animate="show"
    >
      {content.map((child) => (
        <motion.div key={child.key} variants={heroFadeUpItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
