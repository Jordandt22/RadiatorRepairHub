import React from "react";
import Link from "next/link";

function PageErrorMessage({ message = "Sorry, something went wrong." }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-fit rounded-lg border border-destructive/20 bg-destructive/10 px-12 py-2 text-center font-medium text-destructive">
        {message}
      </div>
      <Link
        href="/"
        className="mx-auto mt-4 block w-fit text-center text-muted-foreground transition-colors hover:text-interactive"
      >
        Go back to the home page
      </Link>
    </div>
  );
}

export default PageErrorMessage;
