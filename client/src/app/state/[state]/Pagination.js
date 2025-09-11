import React from "react";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";

function Pagination({ totalPages, currentPage, state }) {
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

  return (
    <div className="flex items-center justify-between mt-12">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">1</span>-
        <span className="font-medium">20</span> of{" "}
        <span className="font-medium">40</span> results
      </div>

      <div className="flex items-center space-x-2">
        {currentPage > 1 ? (
          <Link
            href={`/state/${state.code}?page=${currentPage - 1}`}
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

        {new Array(totalPages).fill(0).map((_, index) => {
          const page = index + 1;
          return (
            <Link
              key={index}
              className={
                currentPage === page
                  ? pageTabStyle + " text-white bg-blue-500 hover:bg-blue-700"
                  : pageTabStyle + " text-gray-700 hover:bg-gray-300 bg-gray-50"
              }
              href={`/state/${state.code}?page=${page}`}
              prefetch={false}
            >
              {page}
            </Link>
          );
        })}

        {currentPage < totalPages ? (
          <Link
            href={`/state/${state.code}?page=${currentPage + 1}`}
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
