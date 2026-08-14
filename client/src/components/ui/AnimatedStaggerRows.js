"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Matches `sm:2 md:3 lg:4` grids used on categories/states listing pages. */
export const LISTING_GRID_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  columns: { base: 1, sm: 2, md: 3, lg: 4 },
};

/** Matches search listings: `md:2 lg:3 xl:4`. */
export const SEARCH_LISTINGS_BREAKPOINTS = {
  sm: 768,
  md: 1024,
  lg: 1280,
  columns: { base: 1, sm: 2, md: 3, lg: 4 },
};

function columnsForWidth(width, breakpoints = LISTING_GRID_BREAKPOINTS) {
  const { sm, md, lg, columns } = breakpoints;
  if (width >= lg) return columns.lg;
  if (width >= md) return columns.md;
  if (width >= sm) return columns.sm;
  return columns.base;
}

export function useListingGridColumns(
  breakpoints = LISTING_GRID_BREAKPOINTS
) {
  const [columnCount, setColumnCount] = useState(breakpoints.columns.base);

  useEffect(() => {
    const update = () => {
      setColumnCount(columnsForWidth(window.innerWidth, breakpoints));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoints]);

  return columnCount;
}

const DEFAULT_GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

/**
 * Fade in by row via CSS keyframes (replays reliably on client navigations).
 * On search/sort refresh (refreshKey > 0), uses a quick grid fade instead.
 */
export default function AnimatedStaggerRows({
  items,
  getKey,
  renderItem,
  className = DEFAULT_GRID_CLASS,
  refreshKey = 0,
  breakpoints = LISTING_GRID_BREAKPOINTS,
}) {
  const pathname = usePathname();
  const columnCount = useListingGridColumns(breakpoints);
  const useStagger = refreshKey === 0;

  if (!items.length) return null;

  if (!useStagger) {
    return (
      <div
        key={`${pathname}-quick-${refreshKey}`}
        className={`${className} stagger-fade-in-quick`}
      >
        {items.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    );
  }

  return (
    <div key={`${pathname}-stagger`} className={className}>
      {items.map((item, index) => {
        const rowIndex = Math.floor(index / columnCount);
        return (
          <div
            key={getKey(item)}
            className="stagger-fade-in"
            style={{ animationDelay: `${rowIndex * 80}ms` }}
          >
            {renderItem(item)}
          </div>
        );
      })}
    </div>
  );
}
