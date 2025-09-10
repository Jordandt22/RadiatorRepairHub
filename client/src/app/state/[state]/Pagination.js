import React from "react";

function Pagination() {
  return (
    <div className="flex items-center justify-between mt-12">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">1</span>-
        <span className="font-medium">20</span> of{" "}
        <span className="font-medium">40</span> results
      </div>

      <div className="flex items-center space-x-2">
        <button
          disabled
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md cursor-not-allowed"
        >
          Previous
        </button>

        <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
          1
        </button>

        <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          2
        </button>

        <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
