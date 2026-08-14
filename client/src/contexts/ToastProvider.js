"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import CustomToast from "@/components/layout/Toasts/CustomToast";

const ToastContext = createContext(null);
const MOBILE_QUERY = "(max-width: 767px)";

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

function showToast({ message, title, color, duration, className }) {
  return toast.custom(
    (toastId) => (
      <CustomToast
        message={message}
        title={title}
        id={toastId}
        color={color}
      />
    ),
    {
      duration,
      className,
      unstyled: true,
    }
  );
}

export const ToastProvider = ({ children }) => {
  const [position, setPosition] = useState("bottom-right");

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const syncPosition = () => {
      setPosition(media.matches ? "top-center" : "bottom-right");
    };

    syncPosition();
    media.addEventListener("change", syncPosition);
    return () => media.removeEventListener("change", syncPosition);
  }, []);

  const showCustomError = (message, title = "Error") =>
    showToast({
      message,
      title,
      color: "red",
      duration: 5000,
      className: "custom-toast custom-toast-error",
    });

  const showCustomSuccess = (message, title = "Success") =>
    showToast({
      message,
      title,
      color: "green",
      duration: 3000,
      className: "custom-toast custom-toast-success",
    });

  const showCustomInfo = (message, title = "Information") =>
    showToast({
      message,
      title,
      color: "blue",
      duration: 4000,
      className: "custom-toast custom-toast-info",
    });

  return (
    <ToastContext.Provider
      value={{ toast, showCustomError, showCustomSuccess, showCustomInfo }}
    >
      {children}
      <Toaster
        position={position}
        offset={16}
        mobileOffset={{ top: 72 }}
        toastOptions={{
          unstyled: true,
          className: "custom-toast",
          style: {
            background: "transparent",
            boxShadow: "none",
          },
        }}
      />
    </ToastContext.Provider>
  );
};
