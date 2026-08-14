"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const DEFAULT_TEXT = "Draw Attention";
const POWER2_OUT = [0.215, 0.61, 0.355, 1];

export default function StrokeText({
  text = DEFAULT_TEXT,
  strokeColor = "#A78BFA",
  fillColor = "#F8FAFC",
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  delay = 0,
  fillMode = "wipe",
  fontSize = 128,
  fontWeight = 800,
  letterSpacing = -4,
  reverse = false,
  className = "",
  style = {},
}) {
  const rootRef = useRef(null);
  const strokeTextRef = useRef(null);
  const [box, setBox] = useState(null);
  const reduceMotion = useReducedMotion();

  const rawId = useId();
  const wipeId = `stroke-text-wipe-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const characters = useMemo(() => Array.from(String(text ?? "")), [text]);
  const dash = Math.max(fontSize * 7, 200);
  const fillEnabled = fillMode !== "none";
  const useWipe = fillEnabled && fillMode === "wipe";
  const fillDuration = Math.max(0.4, drawDuration * 0.5);

  const fontStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
      fontFamily: "var(--font-plex), ui-sans-serif, system-ui, sans-serif",
    }),
    [fontSize, fontWeight, letterSpacing]
  );

  useLayoutEffect(() => {
    const node = strokeTextRef.current;
    if (!node) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled || !strokeTextRef.current) return;
      let bbox;
      try {
        bbox = strokeTextRef.current.getBBox();
      } catch {
        return;
      }
      if (!bbox || !bbox.width) return;

      const pad = Math.max(Number(strokeWidth) || 1, fontSize * 0.1);
      const next = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2,
      };

      setBox((prev) =>
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5
          ? prev
          : next
      );
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [characters, fontSize, fontWeight, letterSpacing, strokeWidth]);

  const viewBox = box
    ? `${box.x} ${box.y} ${box.width} ${box.height}`
    : `0 ${-fontSize} 600 ${fontSize * 1.3}`;

  const charDelay = (index) => {
    const order = reverse ? characters.length - 1 - index : index;
    return delay + order * stagger;
  };

  return (
    <div
      ref={rootRef}
      className={`block w-full leading-none ${className}`}
      style={style}
    >
      <svg
        className="block h-auto w-full overflow-visible"
        viewBox={viewBox}
        role="presentation"
        aria-hidden="true"
      >
        {useWipe && box ? (
          <defs>
            <clipPath id={wipeId}>
              <motion.rect
                x={box.x}
                y={box.y}
                height={box.height}
                initial={{ width: reduceMotion ? box.width : 0 }}
                animate={{ width: box.width }}
                transition={{
                  duration: reduceMotion ? 0 : fillDuration,
                  delay: reduceMotion ? 0 : delay + drawDuration + fillDelay,
                  ease: [0.42, 0, 0.58, 1],
                }}
              />
            </clipPath>
          </defs>
        ) : null}

        <text
          ref={strokeTextRef}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          xmlSpace="preserve"
          style={fontStyle}
        >
          {characters.map((char, index) => (
            <motion.tspan
              key={`s-${index}`}
              data-stroke-char=""
              strokeDasharray={dash}
              initial={{ strokeDashoffset: reduceMotion ? 0 : dash }}
              animate={{ strokeDashoffset: 0 }}
              transition={{
                duration: reduceMotion ? 0 : drawDuration,
                delay: reduceMotion ? 0 : charDelay(index),
                ease: POWER2_OUT,
              }}
            >
              {char}
            </motion.tspan>
          ))}
        </text>

        {fillEnabled ? (
          <text
            fill={fillColor}
            xmlSpace="preserve"
            style={fontStyle}
            clipPath={useWipe && box ? `url(#${wipeId})` : undefined}
          >
            {characters.map((char, index) => (
              <motion.tspan
                key={`f-${index}`}
                data-fill-char=""
                initial={{
                  opacity: reduceMotion || useWipe ? 1 : 0,
                }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: reduceMotion || useWipe ? 0 : fillDuration,
                  delay:
                    reduceMotion || useWipe
                      ? 0
                      : delay + drawDuration + fillDelay + index * stagger,
                  ease: POWER2_OUT,
                }}
              >
                {char}
              </motion.tspan>
            ))}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
