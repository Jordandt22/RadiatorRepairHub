"use client";

import {
  Children,
  cloneElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 3;

function chunkItems(items, size) {
  const pages = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function getArrowState(el) {
  if (!el) return { canPrev: false, canNext: false };
  const maxScroll = el.scrollWidth - el.clientWidth;
  const left = el.scrollLeft;
  return {
    canPrev: left > 8,
    canNext: maxScroll > 8 && left < maxScroll - 8,
  };
}

function useTrackArrows(trackRef, itemCount) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const { canPrev: nextPrev, canNext: nextNext } = getArrowState(
      trackRef.current
    );
    setCanPrev(nextPrev);
    setCanNext(nextNext);
  }, [trackRef]);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows, itemCount, trackRef]);

  return { canPrev, canNext };
}

function CarouselNavButtons({ canPrev, canNext, onPrev, onNext, className }) {
  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={!canPrev}
        aria-label="Previous"
        onClick={onPrev}
      >
        <ChevronLeft />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={!canNext}
        aria-label="Next"
        onClick={onNext}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

export default function HomeSnapCarousel({
  children,
  label,
  fullWidthMobile = false,
}) {
  const mobileTrackRef = useRef(null);
  const desktopTrackRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const items = Children.toArray(children).filter(Boolean);
  const pages = chunkItems(items, PAGE_SIZE);
  const mobileArrows = useTrackArrows(mobileTrackRef, items.length);
  const desktopArrows = useTrackArrows(desktopTrackRef, pages.length);

  const scrollTrack = (trackRef, direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (!items.length) return null;

  const showMobileArrows = items.length > 1;
  const showDesktopArrows = pages.length > 1;

  return (
    <div className="relative max-w-full">
      <div
        ref={mobileTrackRef}
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        className="flex max-w-full snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain scroll-smooth py-3 [scrollbar-width:none] motion-reduce:scroll-auto md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, index) => (
          <div
            key={child.key ?? index}
            className={
              fullWidthMobile
                ? "relative z-0 w-full min-w-full max-w-full shrink-0 snap-start hover:z-10 [&>*]:h-full [&>*]:min-w-0"
                : "relative z-0 min-w-[85%] max-w-[85%] shrink-0 snap-start hover:z-10 [&>*]:h-full"
            }
          >
            {cloneElement(child)}
          </div>
        ))}
      </div>

      <div
        ref={desktopTrackRef}
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        className="hidden snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-3 [scrollbar-width:none] motion-reduce:scroll-auto md:flex md:scroll-smooth [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, pageIndex) => (
          <div
            key={page.map((child) => child.key).join("-") || pageIndex}
            className="grid w-full min-w-full shrink-0 snap-start grid-cols-3 gap-4"
          >
            {page.map((child, index) => (
              <div
                key={child.key ?? `${pageIndex}-${index}`}
                className="relative z-0 min-w-0 hover:z-10 [&>*]:h-full"
              >
                {cloneElement(child)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {showMobileArrows ? (
        <CarouselNavButtons
          className="mt-4 flex justify-center gap-2 md:hidden"
          canPrev={mobileArrows.canPrev}
          canNext={mobileArrows.canNext}
          onPrev={() => scrollTrack(mobileTrackRef, -1)}
          onNext={() => scrollTrack(mobileTrackRef, 1)}
        />
      ) : null}

      {showDesktopArrows ? (
        <CarouselNavButtons
          className="mt-4 hidden justify-center gap-2 md:flex"
          canPrev={desktopArrows.canPrev}
          canNext={desktopArrows.canNext}
          onPrev={() => scrollTrack(desktopTrackRef, -1)}
          onNext={() => scrollTrack(desktopTrackRef, 1)}
        />
      ) : null}
    </div>
  );
}
