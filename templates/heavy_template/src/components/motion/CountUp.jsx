"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Splits "100%" or "4.9" into parts; null when there is no number to count. */
function parseStat(value) {
  const match = /^(\D*)(\d+(?:\.\d+)?)(\D*)$/.exec(value ?? "");
  if (!match) return null;
  return {
    prefix: match[1],
    number: Number(match[2]),
    suffix: match[3],
    decimals: (match[2].split(".")[1] ?? "").length,
  };
}

/**
 * Counts a numeric stat up when it scrolls into view. `children` is the
 * server-rendered final value, so the correct number ships in the HTML and
 * stays put when JS is off, the value is not a number, or motion is reduced.
 */
export function CountUp({ value, children }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(null);
  const stat = parseStat(value);

  useEffect(() => {
    const parts = parseStat(value);
    const node = ref.current;
    if (!parts || reduce || !node) return;

    let frame = 0;
    let start = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const step = (now) => {
          start ||= now;
          const progress = Math.min(1, (now - start) / 900);
          const eased = 1 - (1 - progress) ** 3;
          setShown((parts.number * eased).toFixed(parts.decimals));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, reduce]);

  if (!stat) return children;

  return (
    <span ref={ref}>
      {shown === null ? children : `${stat.prefix}${shown}${stat.suffix}`}
    </span>
  );
}
