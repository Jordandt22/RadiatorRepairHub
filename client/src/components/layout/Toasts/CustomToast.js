"use client";

import React from "react";
import { toast } from "sonner";

export default function CustomToast({ message, title, id, color }) {
  // Define styles based on color type
  const getStyles = (color) => {
    switch (color) {
      case "red":
        return {
          container:
            "relative flex items-start gap-4 p-4 bg-red-50 rounded-xl shadow-lg w-fit",
          icon: "w-10 h-10 bg-red-100 rounded-full flex items-center justify-center",
          iconColor:
            "w-8 h-8 bg-red-500 rounded-full flex items-center justify-center",
          text: "text-sm font-semibold text-red-800 mb-1",
          message: "text-sm text-red-700",
          closeButton:
            "absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors duration-200 cursor-pointer hover:scale-120",
        };
      case "green":
        return {
          container:
            "relative flex items-start gap-4 p-4 bg-green-50 rounded-xl shadow-lg w-fit",
          icon: "w-10 h-10 bg-green-100 rounded-full flex items-center justify-center",
          iconColor:
            "w-8 h-8 bg-green-500 rounded-full flex items-center justify-center",
          text: "text-sm font-semibold text-green-800 mb-1",
          message: "text-sm text-green-700",
          closeButton:
            "absolute top-3 right-3 text-green-400 hover:text-green-600 transition-colors duration-200 cursor-pointer hover:scale-120",
        };
      case "blue":
        return {
          container:
            "relative flex items-start gap-4 p-4 bg-blue-50 rounded-xl shadow-lg w-fit",
          icon: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center",
          iconColor:
            "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center",
          text: "text-sm font-semibold text-blue-800 mb-1",
          message: "text-sm text-blue-700",
          closeButton:
            "absolute top-3 right-3 text-blue-400 hover:text-blue-600 transition-colors duration-200 cursor-pointer hover:scale-120",
        };
      default:
        return {
          container:
            "relative flex items-start gap-4 p-4 bg-gray-50 rounded-xl shadow-lg w-fit",
          icon: "w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center",
          iconColor:
            "w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center",
          text: "text-sm font-semibold text-gray-800 mb-1",
          message: "text-sm text-gray-700",
          closeButton:
            "absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer hover:scale-120",
        };
    }
  };

  const styles = getStyles(color);

  return (
    <div className={styles.container}>
      <div className="flex-shrink-0">
        <div className={styles.icon}>
          <div className={styles.iconColor}>
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
        <h4 className={styles.text}>{title}</h4>
        <p className={styles.message}>{message}</p>
      </div>
      <button onClick={() => toast.dismiss(id)} className={styles.closeButton}>
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
