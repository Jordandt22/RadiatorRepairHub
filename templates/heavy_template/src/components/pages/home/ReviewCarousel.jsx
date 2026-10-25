"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { easeOut } from "@/lib/motion";
import { card, grid3, muted } from "@/lib/ui";

const VISIBLE = 3;

const slide = {
  enter: (direction) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction * -40 }),
};

function Quote({ item }) {
  return (
    <blockquote className={`${card} m-0 flex h-full flex-col justify-between transition-all duration-300 hover:z-10 hover:-translate-y-2 hover:border-accent hover:shadow-[0_16px_40px_rgba(0,0,0,0.85)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}>
      <p className="m-0 font-medium">“{item.quote}”</p>
      <footer className={`mt-4 text-sm font-semibold ${muted}`}>- {item.author}</footer>
    </blockquote>
  );
}

/**
 * Three quotes at a time. User-controlled only: no autoplay, no swipe-only
 * gesture. The control row is omitted entirely when everything already fits.
 */
export function ReviewCarousel({ items }) {
  const reduce = useReducedMotion();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / VISIBLE));

  if (items.length <= VISIBLE) {
    return (
      <div className={`${grid3} mt-8`}>
        {items.map((item) => (
          <Quote item={item} key={item.author} />
        ))}
      </div>
    );
  }

  // Clamp so the final page is still full instead of showing one lonely quote.
  const start = Math.min(page * VISIBLE, items.length - VISIBLE);
  const shown = items.slice(start, start + VISIBLE);

  function go(next) {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  }

  return (
    <>
      <div className="mt-8" aria-live="polite">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={start}
            className={grid3}
            custom={direction}
            variants={slide}
            initial={reduce ? false : "enter"}
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0 } : { duration: 0.45, ease: easeOut }}
          >
            {shown.map((item) => (
              <Quote item={item} key={item.author} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex justify-center md:justify-start items-center gap-3">
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-btn border-2 border-ink/40 bg-transparent text-ink transition-colors hover:border-ink disabled:opacity-40"
          onClick={() => go(Math.max(0, page - 1))}
          disabled={page === 0}
          aria-label={CHROME.prevReviews}
        >
          <ChevronLeft size={20} strokeWidth={2} aria-hidden />
        </button>
        <p className={`m-0 text-sm tabular-nums ${muted}`}>
          {page + 1} / {pages}
        </p>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-btn border-2 border-ink/40 bg-transparent text-ink transition-colors hover:border-ink disabled:opacity-40"
          onClick={() => go(Math.min(pages - 1, page + 1))}
          disabled={page >= pages - 1}
          aria-label={CHROME.nextReviews}
        >
          <ChevronRight size={20} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </>
  );
}
