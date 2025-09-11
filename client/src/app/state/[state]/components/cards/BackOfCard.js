import React from "react";

function BackOfCard({ title, setActiveCard, children }) {
  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 font-heading text-lg">
          {title}
        </h4>
        <button
          className="group/close transition-all duration-200 cursor-pointer"
          onClick={() => setActiveCard(null)}
        >
          <svg
            className="w-6.5 h-6.5 text-gray-600 group-hover/close:text-blue-500 group-hover/close:scale-115 transition-all duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
}

export default BackOfCard;
