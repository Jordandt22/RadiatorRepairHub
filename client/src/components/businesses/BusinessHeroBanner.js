"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function BusinessHeroBanner({
  src,
  alt,
  children,
  sizes = "(max-width: 768px) 100vw, 100vw",
}) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 bg-slate-900">
      {hasImage ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover object-center"
            priority
            onError={() => setFailed(true)}
          />
          {/* Darken only when a photo is present — otherwise keep plain slate-900 */}
          <div
            className={`absolute inset-0 flex flex-col items-start justify-end md:justify-between pb-4 md:pb-0 ${hasImage ? "bg-black/75" : ""
              }`}
          >
            {children}
          </div>
        </>
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-start justify-end md:justify-between pb-4 md:pb-0 bg-slate-900"
        >
          {children}
        </div>
      )}
    </div>
  );
}
