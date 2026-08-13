"use client";

import Link from "next/link";

function ErrorDisplay({ reset, title = "Something went wrong", message }) {
  return (
    <div className="flex flex-col items-center mt-12 md:mt-28 min-h-[60vh] px-4">
      <h1 className="text-6xl font-bold text-foreground mb-2 text-center">
        Error
      </h1>
      <p className="text-lg text-foreground mb-2 text-center">{title}</p>
      {message ? (
        <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
          {message}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
          An unexpected error occurred. Please try again, or head back home.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {typeof reset === "function" ? (
          <button
            type="button"
            onClick={reset}
            className="text-primary-foreground bg-primary font-medium px-4 py-2 rounded-md hover:bg-primary/90 duration-300 cursor-pointer"
          >
            Try again
          </button>
        ) : null}
        <Link
          href="/"
          className="text-foreground bg-card border border-border font-medium px-4 py-2 rounded-md hover:bg-muted duration-300"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}

export default ErrorDisplay;
