import React from "react";
import { toast } from "react-toastify";

// Custom Toast Component for Error Messages
const CustomErrorToast = ({ message, title = "Error", closeToast }) => (
  <div className="relative flex items-start gap-4 p-4 bg-red-50 rounded-xl shadow-lg">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
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
        </div>
      </div>
    </div>
    <div className="flex-1 pr-8">
      <h4 className="text-sm font-semibold text-red-800 mb-1">{title}</h4>
      <p className="text-sm text-red-700">{message}</p>
    </div>
    <button
      onClick={closeToast}
      className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors duration-200"
    >
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

// Custom Toast Component for Success Messages
const CustomSuccessToast = ({ message, title = "Success", closeToast }) => (
  <div className="relative flex items-start gap-4 p-4 bg-green-50 rounded-xl shadow-lg">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
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
        </div>
      </div>
    </div>
    <div className="flex-1 pr-8">
      <h4 className="text-sm font-semibold text-green-800 mb-1">{title}</h4>
      <p className="text-sm text-green-700">{message}</p>
    </div>
    <button
      onClick={closeToast}
      className="absolute top-3 right-3 text-green-400 hover:text-green-600 transition-colors duration-200"
    >
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

// Custom Toast Component for Info Messages
const CustomInfoToast = ({ message, title = "Info", closeToast }) => (
  <div className="relative flex items-start gap-4 p-4 bg-blue-50 rounded-xl shadow-lg">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
        </div>
      </div>
    </div>
    <div className="flex-1 pr-8">
      <h4 className="text-sm font-semibold text-blue-800 mb-1">{title}</h4>
      <p className="text-sm text-blue-700">{message}</p>
    </div>
    <button
      onClick={closeToast}
      className="absolute top-3 right-3 text-blue-400 hover:text-blue-600 transition-colors duration-200"
    >
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

// Toast Functions
const defaultToastOptions = {
  position: "bottom-right",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
};

export const showCustomError = (message, title = "Validation Error") => {
  toast(
    ({ closeToast }) => (
      <CustomErrorToast
        message={message}
        title={title}
        closeToast={closeToast}
      />
    ),
    {
      ...defaultToastOptions,
      autoClose: 2000,
      className: "custom-toast custom-toast-error",
      toastId: `error-${Date.now()}`,
    }
  );
};

export const showCustomSuccess = (message, title = "Success") => {
  toast(
    ({ closeToast }) => (
      <CustomSuccessToast
        message={message}
        title={title}
        closeToast={closeToast}
      />
    ),
    {
      ...defaultToastOptions,
      autoClose: 3000,
      className: "custom-toast custom-toast-success",
      toastId: `success-${Date.now()}`,
    }
  );
};

export const showCustomInfo = (message, title = "Information") => {
  toast(
    ({ closeToast }) => (
      <CustomInfoToast
        message={message}
        title={title}
        closeToast={closeToast}
      />
    ),
    {
      ...defaultToastOptions,
      autoClose: 4000,
      className: "custom-toast custom-toast-info",
      toastId: `info-${Date.now()}`,
    }
  );
};

const CustomToast = {
  showCustomError,
  showCustomSuccess,
  showCustomInfo,
};

export default CustomToast;
