import React from "react";

// Components
import NotFoundDisplay from "@/components/pages/not-found/NotFoundDisplay";

function NotFound() {
  return (
    <NotFoundDisplay
      link={{
        path: `/states`,
        text: `Go back to the States Page`,
      }}
      message="The City Page you are looking for does not exist."
    />
  );
}

export default NotFound;
