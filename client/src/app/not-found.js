import React from "react";
import NotFoundDisplay from "@/components/pages/not-found/NotFoundDisplay";
import { NOT_FOUND_METADATA } from "@/lib/seo/metadata";

export const metadata = NOT_FOUND_METADATA;

function NotFound() {
  return (
    <NotFoundDisplay
      link={{ path: "/", text: "Go back to the home page" }}
      message="The page you are looking for does not exist."
    />
  );
}

export default NotFound;
