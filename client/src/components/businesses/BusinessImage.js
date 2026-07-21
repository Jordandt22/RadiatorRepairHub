"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import { bypassImageOptimizer } from "@/lib/images";

function BusinessImage({
  src,
  alt,
  fill = true,
  sizes,
  className = "object-cover",
  priority = false,
  showIcon = true,
  iconSize = "md",
  // "message" = No image available UI; "solid" = blank colored background
  fallback = "message",
  fallbackClassName = "bg-slate-900",
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (fallback === "solid") {
      return (
        <div
          className={`absolute inset-0 w-full h-full ${fallbackClassName}`}
          aria-hidden="true"
        />
      );
    }

    const iconClass =
      iconSize === "lg"
        ? "w-16 h-16 md:w-20 md:h-20"
        : iconSize === "sm"
          ? "w-12 h-12"
          : "w-16 h-16";
    const alertClass =
      iconSize === "lg"
        ? "w-8 h-8 md:w-10 md:h-10"
        : iconSize === "sm"
          ? "w-6 h-6"
          : "w-8 h-8";
    const textClass =
      iconSize === "lg" ? "text-sm md:text-lg" : "text-sm";

    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          {showIcon && (
            <div
              className={`${iconClass} bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2`}
            >
              <CircleAlert className={`${alertClass} text-gray-500`} />
            </div>
          )}
          <p className={`text-gray-500 ${textClass}`}>No image available</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={bypassImageOptimizer}
      onError={() => setFailed(true)}
    />
  );
}

export default BusinessImage;
