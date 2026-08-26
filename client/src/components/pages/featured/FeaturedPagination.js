import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { buildFeaturedHref } from "./featuredUrl";

const pageTabStyle =
  "px-3 py-2 text-sm font-medium border border-border rounded-full duration-200";
const pageLinkStyle = `block ${pageTabStyle}`;
const pageLinkActiveStyle = `${pageLinkStyle} text-muted-foreground bg-card hover:bg-muted cursor-pointer`;
const pageLinkDisabledStyle = `${pageLinkStyle} text-border bg-muted cursor-not-allowed`;

function windowedPages(currentPage, totalPages) {
  const pages = [1];
  const startPage = Math.max(2, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  if (startPage > 2) pages.push("...");
  for (let i = startPage; i <= endPage; i += 1) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }
  if (endPage < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

function mobilePages(currentPage, totalPages) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  if (isFirstPage) return [1, 2, 3];
  if (isLastPage) return [totalPages - 2, totalPages - 1, totalPages];
  return [currentPage - 1, currentPage, currentPage + 1];
}

export default function FeaturedPagination({
  currentPage,
  totalPages,
  totalBusinesses,
  pageSize,
  sort,
  q,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const lowerLimit = pageSize * (currentPage - 1) + 1;
  const upperLimit = Math.min(totalBusinesses, lowerLimit + pageSize - 1);
  const getHref = (pageNum) => buildFeaturedHref({ page: pageNum, sort, q });

  return (
    <nav
      className="mt-12 mb-8 flex flex-col items-center justify-between md:flex-row"
      aria-label="Featured businesses pages"
    >
      <p className="mb-4 text-sm text-muted-foreground md:mb-0">
        Showing <span className="font-medium">{lowerLimit}</span>-
        <span className="font-medium">{upperLimit}</span> of{" "}
        <span className="font-medium">{totalBusinesses}</span> results
      </p>

      <div className="flex items-center space-x-2">
        {currentPage > 1 ? (
          <Link
            href={getHref(currentPage - 1)}
            prefetch={false}
            className={pageLinkActiveStyle}
            aria-label="Previous page"
          >
            <MoveLeft className="h-5 w-5" />
          </Link>
        ) : (
          <span className={pageLinkDisabledStyle} aria-hidden="true">
            <MoveLeft className="h-5 w-5" />
          </span>
        )}

        <div className="flex items-center space-x-2 md:hidden">
          {mobilePages(currentPage, totalPages).map((page) => (
            <Link
              key={`featured-mobile-${page}`}
              href={getHref(page)}
              prefetch={false}
              className={
                currentPage === page
                  ? `${pageTabStyle} border-primary bg-primary text-primary-foreground hover:bg-primary/90`
                  : `${pageTabStyle} bg-card text-foreground hover:bg-muted`
              }
            >
              {page}
            </Link>
          ))}
        </div>

        <div className="hidden items-center space-x-2 md:flex">
          {windowedPages(currentPage, totalPages).map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`featured-ellipsis-${index}`}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            return (
              <Link
                key={`featured-desktop-${page}`}
                href={getHref(page)}
                prefetch={false}
                className={
                  currentPage === page
                    ? `${pageTabStyle} border-primary bg-primary text-primary-foreground hover:bg-primary/90`
                    : `${pageTabStyle} bg-card text-foreground hover:bg-muted`
                }
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
            aria-label="Next page"
          >
            <MoveRight className="h-5 w-5" />
          </Link>
        ) : (
          <span className={pageLinkDisabledStyle} aria-hidden="true">
            <MoveRight className="h-5 w-5" />
          </span>
        )}
      </div>
    </nav>
  );
}
