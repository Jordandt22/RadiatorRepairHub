"use client";

import React from "react";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function Pagination({
  totalPages,
  currentPage,
  totalBusinesses,
  requestTotal,
  stateData,
  cityData,
  limit,
}) {
  const { appliedFilters, getSortOption } = useFilters();

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

  const mobilePaginationPages = [];
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  mobilePaginationPages.push(
    isFirstPage ? currentPage : isLastPage ? currentPage - 2 : currentPage - 1
  );
  mobilePaginationPages.push(
    isFirstPage ? currentPage + 1 : isLastPage ? currentPage - 1 : currentPage
  );
  mobilePaginationPages.push(
    isFirstPage ? currentPage + 2 : isLastPage ? currentPage : currentPage + 1
  );

  const getHref = (page) => {
    return `/state/${stateData.code}${
      cityData ? `/city/${cityData.slug}` : ""
    }?page=${page}&sort=${getSortOption(appliedFilters.sort_option)}`;
  };

  const lowerLimit = limit * (currentPage - 1) + 1;
  const upperLimit = lowerLimit + requestTotal - 1;
  return (
    <div className="flex md:flex-row flex-col items-center justify-between mt-12 mb-8">
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
                    ? pageTabStyle + " text-white bg-blue-500 hover:bg-blue-700"
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

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-2">
          {new Array(totalPages).fill(0).map((_, index) => {
            const page = index + 1;
            return (
              <Link
                key={"desktop-pagination-" + page}
                className={
                  currentPage === page
                    ? pageTabStyle + " text-white bg-blue-500 hover:bg-blue-700"
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
  );
}

export default Pagination;
