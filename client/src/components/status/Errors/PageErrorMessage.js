import React from "react";
import Link from "next/link";

function PageErrorMessage({ message = "Sorry, something went wrong." }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-500 text-white rounded-md w-fit mx-auto px-12 py-2 text-center font-medium">
        {message}
      </div>
      <Link
        href="/"
        className="text-gray-500 hover:text-blue-500 mx-auto block text-center mt-4 w-fit"
      >
        Go back to the home page
      </Link>
    </div>
  );
}

export default PageErrorMessage;
