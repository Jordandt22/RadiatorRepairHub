"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const HINGE_CONFIG = {
  top: { origin: "50% 0%", rotateX: -92, rotateY: 0 },
  bottom: { origin: "50% 100%", rotateX: 92, rotateY: 0 },
  left: { origin: "0% 50%", rotateX: 0, rotateY: 92 },
  right: { origin: "100% 50%", rotateX: 0, rotateY: -92 },
};

const POWER3_OUT = [0.215, 0.61, 0.355, 1];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function FoldText({
  text = "Design unfolds",
  splitBy = "char",
  hinge = "top",
  duration = 0.65,
  stagger = 0.045,
  delay = 0,
  perspective = 700,
  creaseShading = 0.55,
  fontSize,
  fontWeight,
  color,
  className = "",
  style = {},
}) {
  const reduceMotion = useReducedMotion();
  const hingeConfig = HINGE_CONFIG[hinge] || HINGE_CONFIG.top;
  const safeCrease = clamp(creaseShading, 0, 1);
  const safePerspective = Math.max(120, perspective);
  const activeDuration = reduceMotion ? 0 : duration;
  const activeStagger = reduceMotion ? 0 : stagger;

  const pieces = useMemo(() => {
    if (splitBy === "line") {
      return text.split("\n").map((line, index) => ({
        key: `line-${index}`,
        content: line || "\u00A0",
        split: "line",
      }));
    }

    if (splitBy === "word") {
      return text.split(/(\s+)/).flatMap((part, index) => {
        if (!part) return [];
        if (/^\s+$/.test(part)) {
          return [
            {
              key: `ws-${index}`,
              content: part.replace(/ /g, "\u00A0"),
              whitespace: true,
            },
          ];
        }
        return [{ key: `word-${index}`, content: part, split: "word" }];
      });
    }

    return Array.from(text).flatMap((char, index) => {
      if (char === "\n") return [];
      return [
        {
          key: `char-${index}`,
          content: char === " " ? "\u00A0" : char,
          split: "char",
        },
      ];
    });
  }, [text, splitBy]);

  let foldIndex = 0;

  return (
    <span
      className={`fold-text ${className}`.trim()}
      style={{
        ...(fontSize != null
          ? {
              fontSize:
                typeof fontSize === "number" ? `${fontSize}px` : fontSize,
            }
          : null),
        ...(fontWeight != null ? { fontWeight } : null),
        ...(color != null ? { color } : null),
        ...style,
      }}
    >
      <span className="sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {pieces.map((piece) => {
          if (piece.whitespace) {
            return (
              <span key={piece.key} className="fold-text-whitespace">
                {piece.content}
              </span>
            );
          }

          const index = foldIndex;
          foldIndex += 1;

          return (
            <span
              key={piece.key}
              className="fold-text-segment"
              data-fold-split={piece.split}
              style={{ perspective: `${safePerspective}px` }}
            >
              <motion.span
                className="fold-text-piece"
                data-fold-hinge={hinge}
                style={{
                  transformOrigin: hingeConfig.origin,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
                initial={{
                  opacity: 0,
                  rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
                  rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
                  ["--fold-crease"]: reduceMotion ? 0 : safeCrease,
                }}
                animate={{
                  opacity: 1,
                  rotateX: 0,
                  rotateY: 0,
                  ["--fold-crease"]: 0,
                }}
                transition={{
                  duration: activeDuration,
                  delay: delay + index * activeStagger,
                  ease: POWER3_OUT,
                }}
              >
                {piece.content}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
