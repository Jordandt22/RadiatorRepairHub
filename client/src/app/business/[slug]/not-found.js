import React from "react";
import NotFoundDisplay from "@/components/pages/not-found/NotFoundDisplay";

function NotFound() {
  return (
    <NotFoundDisplay
      link={{ path: "/search", text: "Go back to the Search Page" }}
      message="The business you are looking for does not exist."
    />
  );
}

export default NotFound;
