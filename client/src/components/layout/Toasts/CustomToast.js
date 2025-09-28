"use client";

import React from "react";
import { toast } from "sonner";

export default function CustomToast({ message, title, id, color }) {
  // Define styles based on color type
  const containerStyles =
    "relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg w-fit max-w-xs sm:max-w-sm md:max-w-md";
  const iconStyles =
    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0";
  const iconColorStyles =
    "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center";
  const textStyles = "text-xs sm:text-sm font-semibold mb-1";
  const messageStyles = "text-xs sm:text-sm leading-relaxed";
  const closeButtonStyles =
    "absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer hover:scale-110 sm:hover:scale-120";
  const getStyles = (color) => {
    switch (color) {
      case "red":
        return {
          container: `bg-red-50 ${containerStyles}`,
          icon: `${iconStyles} bg-red-100`,
          iconColor: `${iconColorStyles} bg-red-500`,
          text: `${textStyles} text-red-800`,
          message: `${messageStyles} text-red-700`,
          closeButton: `${closeButtonStyles} text-red-400 hover:text-red-600`,
        };
      case "green":
        return {
          container: `bg-green-50 ${containerStyles}`,
          icon: `${iconStyles} bg-green-100`,
          iconColor: `${iconColorStyles} bg-green-500`,
          text: `${textStyles} text-green-800`,
          message: `${messageStyles} text-green-700`,
          closeButton: `${closeButtonStyles} text-green-400 hover:text-green-600`,
        };
      case "blue":
        return {
          container: `bg-blue-50 ${containerStyles}`,
          icon: `${iconStyles} bg-blue-100`,
          iconColor: `${iconColorStyles} bg-blue-500`,
          text: `${textStyles} text-blue-800`,
          message: `${messageStyles} text-blue-700`,
          closeButton: `${closeButtonStyles} text-blue-400 hover:text-blue-600`,
        };
      default:
        return {
          container: `bg-gray-50 ${containerStyles}`,
          icon: `${iconStyles} bg-gray-100`,
          iconColor: `${iconColorStyles} bg-gray-500`,
          text: `${textStyles} text-gray-800`,
          message: `${messageStyles} text-gray-700`,
          closeButton: `${closeButtonStyles} text-gray-400 hover:text-gray-600`,
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
      <div className="flex-1 pr-8 sm:pr-12 md:pr-16 lg:pr-20">
        <h4 className={styles.text}>{title}</h4>
        <p className={styles.message}>{message}</p>
      </div>
      <button onClick={() => toast.dismiss(id)} className={styles.closeButton}>
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
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
