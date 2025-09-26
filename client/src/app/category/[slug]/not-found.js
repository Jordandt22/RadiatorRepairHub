import React from "react";

// Components
import NotFoundDisplay from "@/components/pages/not-found/NotFoundDisplay";

function NotFound() {
  return (
    <NotFoundDisplay
      link={{ path: "/categories", text: "Go back to the Categories Page" }}
      message="The Category Page you are looking for does not exist."
    />
  );
}

export default NotFound;
