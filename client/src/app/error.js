"use client";

import { useEffect } from "react";
import ErrorDisplay from "@/components/pages/error/ErrorDisplay";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorDisplay
      reset={reset}
      message={
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined
      }
    />
  );
}
