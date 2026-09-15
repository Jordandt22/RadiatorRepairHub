import React from "react";
import NotFoundDisplay from "@/components/pages/not-found/NotFoundDisplay";

function NotFound() {
  return (
    <NotFoundDisplay
      link={{
        path: `/categories`,
        text: `Browse all categories`,
      }}
      message="The category and state combination you are looking for does not exist or has no listings yet."
    />
  );
}

export default NotFound;
