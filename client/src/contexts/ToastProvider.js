"use client";

import React, { createContext, useContext } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Components
import CustomToast from "@/components/Toasts/CustomToast";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);
export const ToastProvider = ({ children }) => {
  const showCustomError = (message, title = "Error") => {
    const id = uuidv4();

    toast(
      () => <CustomToast message={message} title={title} id={id} color="red" />,
      {
        position: "bottom-right",
        duration: 5000,
        className: "custom-toast custom-toast-error",
        id,
      }
    );
  };

  const showCustomSuccess = (message, title = "Success") => {
    const id = uuidv4();

    toast(
      () => (
        <CustomToast message={message} title={title} id={id} color="green" />
      ),
      {
        position: "bottom-right",
        duration: 3000,
        className: "custom-toast custom-toast-success",
        id,
      }
    );
  };

  const showCustomInfo = (message, title = "Information") => {
    const id = uuidv4();

    toast(
      () => (
        <CustomToast message={message} title={title} id={id} color="blue" />
      ),
      {
        position: "bottom-right",
        duration: 4000,
        className: "custom-toast custom-toast-info",
        id,
      }
    );
  };

  return (
    <ToastContext.Provider
      value={{ toast, showCustomError, showCustomSuccess, showCustomInfo }}
    >
      {children}
    </ToastContext.Provider>
  );
};
