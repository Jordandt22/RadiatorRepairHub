"use client";

import { useEffect } from "react";
import ErrorDisplay from "@/components/pages/error/ErrorDisplay";
import "./globals.css";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorDisplay
          reset={reset}
          title="Something went wrong"
          message={
            process.env.NODE_ENV === "development"
              ? error?.message
              : undefined
          }
        />
      </body>
    </html>
  );
}
