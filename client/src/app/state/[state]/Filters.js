import React from "react";

function Filters() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <select className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
        <option value="">Sort by Rating</option>
        <option value="rating-high">Highest Rating</option>
        <option value="rating-low">Lowest Rating</option>
      </select>

      <select className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
        <option value="">Sort by Reviews</option>
        <option value="reviews-high">Most Reviews</option>
        <option value="reviews-low">Least Reviews</option>
      </select>
    </div>
  );
}

export default Filters;
