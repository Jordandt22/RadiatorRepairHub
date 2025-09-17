"use client";

import React from "react";
import { toast } from "sonner";

export default function CustomToast({ message, title, id, color }) {
  const containerStyle = `relative flex items-start gap-4 p-4 bg-${color}-50 rounded-xl shadow-lg w-fit`;
  const iconStyle = `w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`;
  const iconColorStyle = `w-8 h-8 bg-${color}-500 rounded-full flex items-center justify-center`;
  const textStyle = `text-sm font-semibold text-${color}-800 mb-1`;
  const messageStyle = `text-sm text-${color}-700`;
  const closeButtonStyle = `absolute top-3 right-3 text-${color}-400 hover:text-${color}-600 transition-colors duration-200 cursor-pointer hover:scale-120`;

  return (
    <div className={containerStyle}>
      <div className="flex-shrink-0">
        <div className={iconStyle}>
          <div className={iconColorStyle}>
            {color === "red" ? (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            ) : color === "green" ? (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 pr-20">
        <h4 className={textStyle}>{title}</h4>
        <p className={messageStyle}>{message}</p>
      </div>
      <button onClick={() => toast.dismiss(id)} className={closeButtonStyle}>
        <svg
          className="w-5 h-5"
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
  );
}
