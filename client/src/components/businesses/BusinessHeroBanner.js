"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  bypassImageOptimizer,
  buildCfImageUrl,
  BUSINESS_HERO_IMAGE_SIZES,
  CF_IMAGE_VARIANT,
  getBusinessImageId,
} from "@/lib/images";

export default function BusinessHeroBanner({
  src,
  businessId,
  imageId,
  cdnStored = false,
  alt,
  children,
  sizes = BUSINESS_HERO_IMAGE_SIZES,
}) {
  const cfImageId = getBusinessImageId({
    businessId,
    imageId,
    cdnStored,
  });
  const cdnSrc = buildCfImageUrl(cfImageId, CF_IMAGE_VARIANT.hero);
  const canUseCdn = Boolean(cdnSrc);
  const hasRemote = Boolean(src);

  const [source, setSource] = useState(() =>
    canUseCdn ? "cdn" : hasRemote ? "remote" : "none"
  );

  const hasImage = source !== "none";

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 bg-primary">
      {hasImage ? (
        <>
          {source === "cdn" ? (
            <Image
              src={cdnSrc}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover object-center"
              priority
              unoptimized
              onError={() => setSource(hasRemote ? "remote" : "none")}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover object-center"
              priority
              unoptimized={bypassImageOptimizer}
              referrerPolicy="no-referrer"
              onError={() => setSource("none")}
            />
          )}
          {/* Darken only when a photo is present — otherwise keep the plain ink banner */}
          <div
            className={`absolute inset-0 flex flex-col items-start justify-end md:justify-between pb-4 md:pb-0 ${
              hasImage ? "bg-gradient-to-t from-black/70 via-black/40 to-black/20" : ""
            }`}
          >
            {children}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-start justify-end md:justify-between pb-4 md:pb-0 bg-primary">
          {children}
        </div>
      )}
    </div>
  );
}
