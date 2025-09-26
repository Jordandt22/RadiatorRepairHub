import React from "react";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";

function Pagination({
  totalPages,
  currentPage,
  totalBusinesses,
  requestTotal,
  categorySlug,
  limit,
}) {
  if (totalPages <= 1) return null;

  // Page Tab Styles
  const pageTabStyle =
    "px-3 py-2 text-sm font-medium border border-gray-300 rounded-md duration-300";

  // Page Link Styles
  const pageLinkStyle = "block " + pageTabStyle;
  const pageLinkActiveStyle =
    pageLinkStyle +
    " text-gray-500 bg-gray-200 hover:bg-gray-300 cursor-pointer";
  const pageLinkDisabledStyle =
    pageLinkStyle +
    " text-gray-300 bg-gray-50 hover:bg-gray-100 cursor-not-allowed";
  const pageLinkIconStyle = "w-5 h-5";

  // Generate href for pagination links
  const getHref = (page) => {
    if (page === 1) {
      return `/category/${categorySlug}`;
    }
    return `/category/${categorySlug}?page=${page}`;
  };

  // Mobile pagination pages (3 pages)
  const mobilePaginationPages = [];
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) {
      mobilePaginationPages.push(i);
    }
  } else {
    mobilePaginationPages.push(
      isFirstPage ? currentPage : isLastPage ? currentPage - 2 : currentPage - 1
    );
    mobilePaginationPages.push(
      isFirstPage ? currentPage + 1 : isLastPage ? currentPage - 1 : currentPage
    );
    mobilePaginationPages.push(
      isFirstPage ? currentPage + 2 : isLastPage ? currentPage : currentPage + 1
    );
  }

  // Generate windowed pagination for desktop
  const generateWindowedPages = () => {
    const pages = [];
    const windowSize = 2; // Show 2 pages on each side of current page

    // Always show first page
    pages.push(1);

    // Calculate the range around current page
    const startPage = Math.max(2, currentPage - windowSize);
    const endPage = Math.min(totalPages - 1, currentPage + windowSize);

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("...");
    }

    // Add pages in the window
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        // Don't duplicate first/last pages
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const lowerLimit = limit * (currentPage - 1) + 1;
  const upperLimit = lowerLimit + requestTotal - 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex md:flex-row flex-col items-center justify-between mt-12 pb-8">
        <div className="text-sm text-gray-700 mb-4 md:mb-0">
          Showing <span className="font-medium">{lowerLimit}</span>-
          <span className="font-medium">{upperLimit}</span> of{" "}
          <span className="font-medium">{totalBusinesses}</span> results
        </div>

        <div className="flex items-center space-x-2">
          {currentPage > 1 ? (
            <Link
              href={getHref(currentPage - 1)}
              prefetch={false}
              className={pageLinkActiveStyle}
            >
              <MoveLeft className={pageLinkIconStyle} />
            </Link>
          ) : (
            <span className={pageLinkDisabledStyle}>
              <MoveLeft className={pageLinkIconStyle} />
            </span>
          )}

          {/* 3 Pages Pagination */}
          <div className="flex md:hidden items-center space-x-2">
            {mobilePaginationPages.map((page) => {
              return (
                <Link
                  key={"mobile-pagination-" + page}
                  className={
                    currentPage === page
                      ? pageTabStyle +
                        " text-white bg-blue-500 hover:bg-blue-700"
                      : pageTabStyle +
                        " text-gray-700 hover:bg-gray-300 bg-gray-50"
                  }
                  href={getHref(page)}
                  prefetch={false}
                >
                  {page}
                </Link>
              );
            })}
          </div>

          {/* Desktop - Windowed Pagination */}
          <div className="hidden md:flex items-center space-x-2">
            {generateWindowedPages().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`desktop-pagination-ellipsis-${index}`}
                    className="px-3 py-2 text-sm font-medium text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              return (
                <Link
                  key={`desktop-pagination-${page}`}
                  className={
                    currentPage === page
                      ? pageTabStyle +
                        " text-white bg-blue-500 hover:bg-blue-700"
                      : pageTabStyle +
                        " text-gray-700 hover:bg-gray-300 bg-gray-50"
                  }
                  href={getHref(page)}
                  prefetch={false}
                >
                  {page}
                </Link>
              );
            })}
          </div>

          {currentPage < totalPages ? (
            <Link
              href={getHref(currentPage + 1)}
              prefetch={false}
              className={pageLinkActiveStyle}
            >
              <MoveRight className={pageLinkIconStyle} />
            </Link>
          ) : (
            <span className={pageLinkDisabledStyle}>
              <MoveRight className={pageLinkIconStyle} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pagination;
