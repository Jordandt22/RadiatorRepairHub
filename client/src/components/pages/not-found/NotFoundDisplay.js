import React from "react";
import Link from "next/link";

function NotFoundDisplay({ link, message }) {
  return (
    <div>
      <div className="flex flex-col items-center mt-12 md:mt-28 h-screen px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-2 text-center">
          404
        </h1>
        <p className="text-lg text-gray-900 mb-8 text-center">{message}</p>
        <Link
          href={link.path}
          className="text-white bg-blue-500 font-medium px-4 py-2 rounded-md hover:bg-blue-600 duration-300 hover:scale-105 block"
        >
          {link.text}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundDisplay;
