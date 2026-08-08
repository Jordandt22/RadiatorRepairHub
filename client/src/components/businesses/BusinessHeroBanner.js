"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import {
  bypassImageOptimizer,
  BUSINESS_HERO_IMAGE_SIZES,
  getCloudinaryPublicId,
} from "@/lib/images";

export default function BusinessHeroBanner({
  src,
  placeId,
  businessId,
  imageId,
  cdnStored = false,
  alt,
  children,
  sizes = BUSINESS_HERO_IMAGE_SIZES,
}) {
  const publicId = getCloudinaryPublicId({
    businessId,
    imageId,
    placeId,
    cdnStored,
  });
  const canUseCloudinary = Boolean(cdnStored && publicId);
  const hasRemote = Boolean(src);

  const [source, setSource] = useState(() =>
    canUseCloudinary ? "cloudinary" : hasRemote ? "remote" : "none"
  );

  const hasImage = source !== "none";

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 bg-slate-900">
      {hasImage ? (
        <>
          {source === "cloudinary" ? (
            <CldImage
              src={publicId}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover object-center"
              priority
              crop="fill"
              gravity="center"
              format="auto"
              quality="auto:good"
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
          {/* Darken only when a photo is present — otherwise keep plain slate-900 */}
          <div
            className={`absolute inset-0 flex flex-col items-start justify-end md:justify-between pb-4 md:pb-0 ${
              hasImage ? "bg-black/75" : ""
            }`}
          >
            {children}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-start justify-end md:justify-between pb-4 md:pb-0 bg-slate-900">
          {children}
        </div>
      )}
    </div>
  );
}
