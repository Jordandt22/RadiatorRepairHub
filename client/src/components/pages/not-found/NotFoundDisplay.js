import React from "react";
import Link from "next/link";

function NotFoundDisplay({ link, message }) {
  return (
    <div>
      <div className="flex flex-col items-center mt-12 md:mt-28 h-screen px-4">
        <h1 className="text-6xl font-bold text-foreground mb-2 text-center">
          404
        </h1>
        <p className="text-lg text-foreground mb-8 text-center">{message}</p>
        <Link
          href={link.path}
          className="text-primary-foreground bg-primary font-medium px-4 py-2 rounded-md hover:bg-primary/90 duration-300 block"
        >
          {link.text}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundDisplay;
