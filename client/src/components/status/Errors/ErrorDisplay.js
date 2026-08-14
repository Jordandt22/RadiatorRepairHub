import React from "react";
import Link from "next/link";

function ErrorDisplay({
  status = "500",
  code = "Server Error",
  message = "Sorry, an error occurred. Please try again later.",
  link = {
    path: "/",
    text: "Go Back to Home Page",
  },
}) {
  return (
    <div>
      <div className="mt-12 flex h-screen flex-col items-center px-4 md:mt-28">
        <h1 className="mb-4 text-center text-6xl font-bold text-destructive">
          {status}
        </h1>
        <p className="mb-4 rounded-full bg-destructive/10 px-4 py-1 text-center text-lg capitalize text-destructive">
          {code.replace("-", " ")}
        </p>
        <p className="mb-8 text-center text-lg text-muted-foreground">
          {message}
        </p>
        <Link
          href={link.path}
          className="block rounded-full bg-primary px-4 py-2 font-medium capitalize text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
        >
          {link.text}
        </Link>
      </div>
    </div>
  );
}

export default ErrorDisplay;
