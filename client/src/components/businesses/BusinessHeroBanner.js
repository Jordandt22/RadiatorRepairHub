"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
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
  top = null,
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
    <div
      className={`relative isolate flex min-h-[42svh] w-full flex-col overflow-hidden sm:min-h-[46svh] md:min-h-[50svh] ${
        hasImage ? "" : "section-signature"
      }`}
    >
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
              unoptimized
              referrerPolicy="no-referrer"
              onError={() => setSource("none")}
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className="relative z-[1] flex min-h-[42svh] w-full flex-1 flex-col justify-between sm:min-h-[46svh] md:min-h-[50svh]">
        {top ? <div className="w-full">{top}</div> : null}
        <div className="mt-auto w-full">{children}</div>
      </div>
    </div>
  );
}
