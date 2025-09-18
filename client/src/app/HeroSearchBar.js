"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function HeroSearchBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const submitSearch = () => {
    router.push(`/search?title=${search}&page=1&sort=most_reviews`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      submitSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Enter a business name..."
          className="w-full px-6 py-4 text-lg rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900"
          onChange={handleSearch}
          value={search}
          onKeyDown={handleKeyPress}
        />
        <button
          type="button"
          className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center cursor-pointer"
          onClick={submitSearch}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default HeroSearchBar;
