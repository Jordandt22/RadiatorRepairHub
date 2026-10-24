"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { card, grid3, muted } from "@/lib/ui";

const VISIBLE = 3;

function Quote({ item }) {
  return (
    <blockquote className={`${card} m-0 flex h-full flex-col justify-between`}>
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
  const [page, setPage] = useState(0);
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

  return (
    <>
      <div className={`${grid3} mt-8`} aria-live="polite">
        {shown.map((item) => (
          <Quote item={item} key={item.author} />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-btn border-2 border-ink/40 bg-transparent text-ink transition-colors hover:border-ink disabled:opacity-40"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label={CHROME.prevReviews}
        >
          <ChevronLeft size={20} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-btn border-2 border-ink/40 bg-transparent text-ink transition-colors hover:border-ink disabled:opacity-40"
          onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          disabled={page >= pages - 1}
          aria-label={CHROME.nextReviews}
        >
          <ChevronRight size={20} strokeWidth={2} aria-hidden />
        </button>
        <p className={`m-0 text-sm tabular-nums ${muted}`}>
          {page + 1} / {pages}
        </p>
      </div>
    </>
  );
}
