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
      <div className="flex flex-col items-center mt-12 md:mt-28 h-screen px-4">
        <h1 className="text-6xl font-bold text-red-500 mb-4 text-center">
          {status}
        </h1>
        <p className="text-lg bg-red-300 text-red-900 px-4 py-1 rounded-md mb-4 text-center capitalize">
          {code.replace("-", " ")}
        </p>
        <p className="text-lg text-gray-600 mb-8 text-center">{message}</p>
        <Link
          href={link.path}
          className="text-white bg-blue-500 font-medium px-4 py-2 rounded-md hover:bg-blue-600 duration-300 hover:scale-105 block capitalize"
        >
          {link.text}
        </Link>
      </div>
    </div>
  );
}

export default ErrorDisplay;
